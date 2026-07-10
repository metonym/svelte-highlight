import path from "node:path";
import { pathToFileURL } from "node:url";
import MagicString from "magic-string";
import { parse } from "svelte/compiler";
import { ensureRegistered, registry } from "./registry.js";

// Bare specifiers resolve via this package's own subpath exports (Node self-reference).
// Relative paths are only for this repo's own internal dev/testing.
const HIGHLIGHT_SOURCE_RE = /^svelte-highlight(\/.*\.svelte)?$/;
const HIGHLIGHT_RELATIVE_RE = /\/Highlight\.svelte$/;
const LANGUAGE_SOURCE_RE = /^svelte-highlight\/languages\//;
const LANGUAGE_RELATIVE_RE = /\/languages\//;

/** @param {string} source */
function isHighlightImportSource(source) {
  return HIGHLIGHT_SOURCE_RE.test(source) || HIGHLIGHT_RELATIVE_RE.test(source);
}

/** @param {string} source */
function isLanguageImportSource(source) {
  return LANGUAGE_SOURCE_RE.test(source) || LANGUAGE_RELATIVE_RE.test(source);
}

/** @param {import("svelte/compiler").AST.Root} ast */
function collectDefaultImports(ast) {
  /** @type {Map<string, string>} */
  const imports = new Map();
  const body = ast.instance?.content.body ?? [];

  for (const node of body) {
    if (node.type !== "ImportDeclaration") continue;
    for (const specifier of node.specifiers) {
      if (specifier.type === "ImportDefaultSpecifier") {
        imports.set(specifier.local.name, String(node.source.value));
      }
    }
  }

  return imports;
}

/**
 * Recursively collect every Component/RegularElement in the fragment tree,
 * including those nested inside control-flow blocks.
 *
 * @param {import("svelte/compiler").AST.Fragment | null | undefined} fragment
 * @param {import("svelte/compiler").AST.ElementLike[]} out
 */
function collectElements(fragment, out = []) {
  if (!fragment) return out;

  for (const node of fragment.nodes) {
    switch (node.type) {
      case "Component":
      case "RegularElement":
        out.push(node);
        collectElements(node.fragment, out);
        break;
      case "IfBlock":
        collectElements(node.consequent, out);
        if (node.alternate) collectElements(node.alternate, out);
        break;
      case "EachBlock":
        collectElements(node.body, out);
        if (node.fallback) collectElements(node.fallback, out);
        break;
      case "AwaitBlock":
        if (node.pending) collectElements(node.pending, out);
        if (node.then) collectElements(node.then, out);
        if (node.catch) collectElements(node.catch, out);
        break;
      case "KeyBlock":
        collectElements(node.fragment, out);
        break;
      case "SnippetBlock":
        collectElements(node.body, out);
        break;
      default:
        break;
    }
  }

  return out;
}

/** @param {import("svelte/compiler").AST.Fragment} fragment */
function isSlotEmpty(fragment) {
  return fragment.nodes.every(
    (node) => node.type === "Text" && node.data.trim() === "",
  );
}

/** @param {import("estree").Expression} expression */
function getStaticStringExpression(expression) {
  if (expression.type === "Literal" && typeof expression.value === "string") {
    return expression.value;
  }
  if (
    expression.type === "TemplateLiteral" &&
    expression.expressions.length === 0
  ) {
    return expression.quasis.map((quasi) => quasi.value.cooked ?? "").join("");
  }
  return null;
}

/** @param {import("svelte/compiler").AST.Attribute} attribute */
function getStaticStringAttribute(attribute) {
  if (attribute.value === true) return null;
  const values = Array.isArray(attribute.value)
    ? attribute.value
    : [attribute.value];
  if (values.length !== 1) return null;
  const [value] = values;
  if (!value) return null;
  if (value.type === "Text") return value.data;
  if (value.type === "ExpressionTag")
    return getStaticStringExpression(value.expression);
  return null;
}

/** @param {import("svelte/compiler").AST.Attribute} attribute */
function getIdentifierAttribute(attribute) {
  if (attribute.value === true) return null;
  const values = Array.isArray(attribute.value)
    ? attribute.value
    : [attribute.value];
  if (values.length !== 1) return null;
  const [value] = values;
  if (
    value?.type !== "ExpressionTag" ||
    value.expression.type !== "Identifier"
  ) {
    return null;
  }
  return value.expression.name;
}

/**
 * @param {import("svelte/compiler").AST.ElementLike} element
 * @param {Map<string, string>} imports
 */
function matchHighlightElement(element, imports) {
  if (element.type !== "Component") return null;

  const importSource = imports.get(element.name);
  if (!importSource || !isHighlightImportSource(importSource)) return null;
  if (!isSlotEmpty(element.fragment)) return null;

  /** @type {Map<string, import("svelte/compiler").AST.Attribute>} */
  const attrs = new Map();
  for (const attribute of element.attributes) {
    // Reject spread attributes and any directive (bind:, on:, use:, class:, etc.) -
    // none of these can be safely replicated in static HTML.
    if (attribute.type !== "Attribute") return null;
    // Reject any attribute outside the supported set (this also excludes `langtag`,
    // which needs global CSS the static output can't guarantee is bundled - see README).
    if (attribute.name !== "language" && attribute.name !== "code") return null;
    attrs.set(attribute.name, attribute);
  }

  const codeAttr = attrs.get("code");
  const languageAttr = attrs.get("language");
  if (!codeAttr || !languageAttr) return null;

  const code = getStaticStringAttribute(codeAttr);
  if (code === null) return null;

  const languageLocalName = getIdentifierAttribute(languageAttr);
  if (languageLocalName === null) return null;

  const languageSource = imports.get(languageLocalName);
  if (!languageSource || !isLanguageImportSource(languageSource)) return null;

  return { code, languageSource };
}

/**
 * @param {string} source
 * @param {string | undefined} filename
 */
async function resolveLanguageModule(source, filename) {
  if (source.startsWith(".") || source.startsWith("/")) {
    const base = filename
      ? path.dirname(path.resolve(filename))
      : process.cwd();
    const resolved = path.resolve(base, source);
    return import(pathToFileURL(resolved).href);
  }
  return import(source);
}

/** @param {string} value */
function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * @param {string} content
 * @param {number} index
 */
function locate(content, index) {
  let line = 1;
  let lastNewline = -1;

  for (let i = 0; i < index; i += 1) {
    if (content[i] === "\n") {
      line += 1;
      lastNewline = i;
    }
  }

  return { line, column: index - lastNewline };
}

/**
 * @param {string} message
 * @param {{ filename?: string | undefined; line: number; cause: unknown }} details
 */
function defaultWarn(message, details) {
  const location = details.filename
    ? `${details.filename}:${details.line}`
    : `line ${details.line}`;
  console.warn(
    `[svelte-highlight/static] ${location} - ${message}; falling back to runtime Highlight.`,
  );
}

/**
 * Escape literal `{`/`}` so Svelte's compiler (which re-parses the preprocessed markup) treats
 * them as text instead of the start/end of a template expression. Needed because the highlighted
 * source can legitimately contain braces (CSS rules, JS/TS blocks and objects, JSON, etc.).
 *
 * @param {string} html
 */
function escapeSvelteBraces(html) {
  return html.replace(/[{}]/g, (char) => (char === "{" ? "{'{'}" : "{'}'}"));
}

/**
 * @param {import("./languages").LanguageType<string>} language
 * @param {string} code
 */
function renderStatic(language, code) {
  ensureRegistered(language);
  const { value } = registry.highlight(code, { language: language.name });
  return escapeSvelteBraces(
    `<pre class="hljs" data-language="${escapeAttribute(language.name)}" ` +
      `style="overflow-x:var(--overflow-x, auto);overflow-y:var(--overflow-y, auto);` +
      `border-radius:var(--border-radius, 0);width:var(--width, auto);max-width:var(--max-width, none)">` +
      `<code class="hljs">${value}</code></pre>`,
  );
}

/**
 * @typedef {{
 *   onWarn?: (message: string, details: { filename?: string | undefined; line: number; cause: unknown }) => void;
 * }} HighlightStaticOptions
 */

/**
 * Build-time preprocessor: replaces `<Highlight code="..." language={lang} />` with
 * pre-rendered highlight.js HTML when `code` and `language` are known at compile time.
 * Dynamic usages keep the runtime component without a warning.
 *
 * If a usage looks static but fails to resolve or highlight, it still falls back and
 * `onWarn` runs (default: `console.warn`).
 *
 * @param {HighlightStaticOptions} [options]
 * @returns {import("svelte/compiler").PreprocessorGroup}
 */
export function highlightStatic(options = {}) {
  const warn = options.onWarn ?? defaultWarn;

  return {
    name: "svelte-highlight-static",
    async markup({ content, filename }) {
      if (
        !content.includes("svelte-highlight") &&
        !content.includes("Highlight.svelte")
      ) {
        return;
      }

      /** @type {import("svelte/compiler").AST.Root} */
      let ast;
      /** @type {{ filename?: string; modern: true }} */
      const parseOptions =
        filename === undefined ? { modern: true } : { filename, modern: true };
      try {
        ast = parse(content, parseOptions);
      } catch {
        // Let the real compiler surface the syntax error.
        return;
      }

      const imports = collectDefaultImports(ast);
      if (imports.size === 0) return;

      const matches = collectElements(ast.fragment)
        .map((element) => {
          const match = matchHighlightElement(element, imports);
          return match && { element, ...match };
        })
        .filter((match) => match !== null);
      if (matches.length === 0) return;

      const htmlByMatch = await Promise.all(
        matches.map(async (match) => {
          const line = locate(content, match.element.start).line;

          /** @type {import("./languages").LanguageType<string>} */
          let language;
          try {
            const languageModule = await resolveLanguageModule(
              match.languageSource,
              filename,
            );
            language = languageModule.default ?? languageModule;
          } catch (cause) {
            warn(
              `could not resolve language module "${match.languageSource}"`,
              {
                filename,
                line,
                cause,
              },
            );
            return null;
          }

          try {
            return renderStatic(language, match.code);
          } catch (cause) {
            warn(
              `highlight.js failed to highlight the code (language "${language.name}")`,
              {
                filename,
                line,
                cause,
              },
            );
            return null;
          }
        }),
      );

      const ms = new MagicString(content);
      let changed = false;

      for (const [index, match] of matches.entries()) {
        const html = htmlByMatch[index];
        if (!html) continue;

        try {
          ms.overwrite(match.element.start, match.element.end, html);
          changed = true;
        } catch (cause) {
          warn("failed to apply the static replacement", {
            filename,
            line: locate(content, match.element.start).line,
            cause,
          });
        }
      }

      if (!changed) return;
      return { code: ms.toString(), map: ms.generateMap({ hires: true }) };
    },
  };
}
