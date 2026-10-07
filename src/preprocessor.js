import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "svelte/compiler";
import { ensureRegistered, registry } from "./registry.js";

// Relative paths are only for this repo's own dev/testing.
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

/**
 * `null` for boolean attributes and multi-part values (`class="a {b}"`).
 * @param {import("svelte/compiler").AST.Attribute} attribute
 */
function getSingleAttributeValue(attribute) {
  if (attribute.value === true) return null;
  const values = Array.isArray(attribute.value)
    ? attribute.value
    : [attribute.value];
  if (values.length !== 1) return null;
  return values[0] ?? null;
}

/** @param {import("svelte/compiler").AST.Attribute} attribute */
function getStaticStringAttribute(attribute) {
  const value = getSingleAttributeValue(attribute);
  if (!value) return null;
  if (value.type === "Text") return value.data;
  if (value.type === "ExpressionTag")
    return getStaticStringExpression(value.expression);
  return null;
}

/** @param {import("svelte/compiler").AST.Attribute} attribute */
function getIdentifierAttribute(attribute) {
  const value = getSingleAttributeValue(attribute);
  if (
    value?.type !== "ExpressionTag" ||
    value.expression.type !== "Identifier"
  ) {
    return null;
  }
  return value.expression.name;
}

/**
 * `null` unless a bare flag or a `{true}`/`{false}` literal.
 * @param {import("svelte/compiler").AST.Attribute} attribute
 */
function getStaticBooleanAttribute(attribute) {
  if (attribute.value === true) return true;
  const value = getSingleAttributeValue(attribute);
  if (value?.type !== "ExpressionTag") return null;
  const { expression } = value;
  if (expression.type === "Literal" && typeof expression.value === "boolean") {
    return expression.value;
  }
  return null;
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
    // Spreads and directives can't be replicated in static HTML.
    if (attribute.type !== "Attribute") return null;
    if (
      attribute.name !== "language" &&
      attribute.name !== "code" &&
      attribute.name !== "langtag"
    ) {
      return null;
    }
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

  const langtagAttr = attrs.get("langtag");
  let langtag = false;
  if (langtagAttr) {
    const value = getStaticBooleanAttribute(langtagAttr);
    if (value === null) return null;
    langtag = value;
  }

  return { code, languageSource, langtag };
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

/** @param {string} value */
function escapeText(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * 1-indexed line of `index` in `content`.
 * @param {string} content
 * @param {number} index
 */
function lineAt(content, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (content[i] === "\n") line += 1;
  }
  return line;
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
 * Svelte re-parses preprocessed markup, so literal braces must be escaped.
 * @param {string} html
 */
function escapeSvelteBraces(html) {
  return html.replace(/[{}]/g, (char) => (char === "{" ? "{'{'}" : "{'}'}"));
}

// Inline copy of `.langtag::after` (src/langtag.css), so static usage needs no stylesheet.
const LANGTAG_BADGE_STYLE =
  "position:absolute;top:var(--langtag-top, 0);right:var(--langtag-right, 0);" +
  "display:flex;align-items:center;justify-content:center;" +
  "background:var(--langtag-background, inherit);color:var(--langtag-color, inherit);" +
  "border-radius:var(--langtag-border-radius, 0);padding:var(--langtag-padding, 1em);" +
  "font-size:var(--langtag-font-size, inherit);";

/**
 * @param {import("./languages").LanguageType<string>} language
 * @param {string} code
 * @param {boolean} langtag
 */
function renderStatic(language, code, langtag) {
  ensureRegistered(language);
  const { value } = registry.highlight(code, { language: language.name });
  const badge = langtag
    ? `<span style="${LANGTAG_BADGE_STYLE}">${escapeText(language.name)}</span>`
    : "";
  return escapeSvelteBraces(
    `<pre class="hljs" data-language="${escapeAttribute(language.name)}" ` +
      `style="${langtag ? "position:relative;" : ""}overflow-x:var(--overflow-x, auto);overflow-y:var(--overflow-y, auto);` +
      `border-radius:var(--border-radius, 0);width:var(--width, auto);max-width:var(--max-width, none)">` +
      `<code class="hljs">${value}</code>${badge}</pre>`,
  );
}

const BASE64_VLQ_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** @param {number} value */
function encodeVlq(value) {
  let vlq = value < 0 ? (-value << 1) + 1 : value << 1;
  let result = "";
  do {
    let digit = vlq & 31;
    vlq >>>= 5;
    if (vlq > 0) digit |= 32;
    result += BASE64_VLQ_CHARS[digit];
  } while (vlq > 0);
  return result;
}

/** @param {string} content */
function computeLineStarts(content) {
  const starts = [0];
  for (let i = 0; i < content.length; i += 1) {
    if (content[i] === "\n") starts.push(i + 1);
  }
  return starts;
}

/**
 * @param {number[]} lineStarts
 * @param {number} index
 */
function positionAt(lineStarts, index) {
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if ((lineStarts[mid] ?? 0) <= index) lo = mid;
    else hi = mid - 1;
  }
  return { line: lo, column: index - (lineStarts[lo] ?? 0) };
}

/**
 * Splices replacements into `content` with a v3 sourcemap. Each edit replaces
 * a whole element, so one segment per edit boundary is enough.
 * @param {string} content
 * @param {{ start: number; end: number; replacement: string }[]} edits sorted by `start`, non-overlapping
 */
function applyEdits(content, edits) {
  const lineStarts = computeLineStarts(content);
  /** @type {string[]} */
  const out = [];
  /** @type {{ genCol: number; line: number; col: number }[][]} */
  const segmentsByLine = [[]];

  let genLine = 0;
  let genCol = 0;

  /**
   * @param {number} line
   * @param {number} col
   */
  function mark(line, col) {
    segmentsByLine[genLine]?.push({ genCol, line, col });
  }

  /**
   * @param {string} text
   * @param {number} [origLine] Only for unedited text: maps each new line's start.
   */
  function advance(text, origLine) {
    let from = 0;
    let line = origLine ?? 0;
    for (let i = 0; i < text.length; i += 1) {
      if (text[i] !== "\n") continue;
      out.push(text.slice(from, i + 1));
      from = i + 1;
      genLine += 1;
      genCol = 0;
      segmentsByLine.push([]);
      if (origLine !== undefined) {
        line += 1;
        mark(line, 0);
      }
    }
    out.push(text.slice(from));
    genCol += text.length - from;
  }

  /**
   * @param {number} start
   * @param {number} end
   */
  function copyUnedited(start, end) {
    if (start === end) return;
    const pos = positionAt(lineStarts, start);
    mark(pos.line, pos.column);
    advance(content.slice(start, end), pos.line);
  }

  let cursor = 0;
  for (const edit of edits) {
    copyUnedited(cursor, edit.start);

    const pos = positionAt(lineStarts, edit.start);
    mark(pos.line, pos.column);
    advance(edit.replacement);

    cursor = edit.end;
  }
  copyUnedited(cursor, content.length);

  let mappings = "";
  let prevLine = 0;
  let prevCol = 0;
  for (const [lineIndex, segments] of segmentsByLine.entries()) {
    if (lineIndex > 0) mappings += ";";
    let prevGenCol = 0;
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      if (!segment) continue;
      mappings += i === 0 ? "" : ",";
      mappings += encodeVlq(segment.genCol - prevGenCol);
      mappings += encodeVlq(0); // single source, index never changes
      mappings += encodeVlq(segment.line - prevLine);
      mappings += encodeVlq(segment.col - prevCol);
      prevGenCol = segment.genCol;
      prevLine = segment.line;
      prevCol = segment.col;
    }
  }

  return {
    code: out.join(""),
    map: { version: 3, sources: [""], names: [], mappings },
  };
}

/**
 * @typedef {{
 *   onWarn?: (message: string, details: { filename?: string | undefined; line: number; cause: unknown }) => void;
 *   onSummary?: (summary: { filename?: string | undefined; matched: number; succeeded: number; failed: number }) => void;
 * }} HighlightStaticOptions
 */

/**
 * Replaces static `<Highlight code="..." language={lang} />` usages with
 * pre-rendered HTML. Dynamic usages are left as-is; static ones that fail
 * fall back and call `onWarn` (default: `console.warn`).
 * @param {HighlightStaticOptions} [options]
 * @returns {import("svelte/compiler").PreprocessorGroup}
 */
export function highlightStatic(options = {}) {
  const warn = options.onWarn ?? defaultWarn;
  const onSummary = options.onSummary;

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

      // One import() per distinct source; import() pays resolution cost even when cached.
      /** @type {Map<string, Promise<any>>} */
      const languageModules = new Map();
      const loadLanguageModule = (/** @type {string} */ source) => {
        let loaded = languageModules.get(source);
        if (!loaded) {
          loaded = resolveLanguageModule(source, filename);
          languageModules.set(source, loaded);
        }
        return loaded;
      };

      const htmlByMatch = await Promise.all(
        matches.map(async (match) => {
          // Lazy: lineAt() is O(content) and only needed when warning.
          const line = () => lineAt(content, match.element.start);

          /** @type {import("./languages").LanguageType<string>} */
          let language;
          try {
            const languageModule = await loadLanguageModule(
              match.languageSource,
            );
            language = languageModule.default ?? languageModule;
          } catch (cause) {
            warn(
              `could not resolve language module "${match.languageSource}"`,
              {
                filename,
                line: line(),
                cause,
              },
            );
            return null;
          }

          try {
            return renderStatic(language, match.code, match.langtag);
          } catch (cause) {
            warn(
              `highlight.js failed to highlight the code (language "${language.name}")`,
              {
                filename,
                line: line(),
                cause,
              },
            );
            return null;
          }
        }),
      );

      /** @type {{ start: number; end: number; replacement: string }[]} */
      const edits = [];

      for (const [index, match] of matches.entries()) {
        const html = htmlByMatch[index];
        if (!html) continue;

        const { start, end } = match.element;
        const previous = edits.at(-1);

        // Defensive: matches can't nest and arrive in source order.
        if (start >= end || (previous && start < previous.end)) {
          warn("failed to apply the static replacement", {
            filename,
            line: lineAt(content, start),
            cause: new Error("invalid or overlapping replacement range"),
          });
          continue;
        }

        edits.push({ start, end, replacement: html });
      }

      onSummary?.({
        filename,
        matched: matches.length,
        succeeded: edits.length,
        failed: matches.length - edits.length,
      });

      if (edits.length === 0) return;
      return applyEdits(content, edits);
    },
  };
}
