/**
 * Convert a highlight.js theme's `.hljs-<scope>` class rules into
 * `::highlight(hljs-<scope>)` rules for the CSS Custom Highlight API, used
 * by the `HighlightEditable` "css-highlights" engine.
 *
 * `::highlight()` only supports `color`/`background-color` across browsers
 * (no `text-decoration`/`text-shadow` everywhere), so every other
 * declaration is dropped. Compound (`.hljs-title.class_`) and descendant
 * (`.hljs-meta .hljs-keyword`) selectors have no `::highlight()` equivalent
 * and are dropped too; only single-class `.hljs-<scope>` selectors convert.
 */

const STYLE_TAG = /^(\s*<style>)([\s\S]*?)(<\/style>\s*)$/;
const SIMPLE_SCOPE_SELECTOR = /^\.hljs-([\w-]+)$/;
const SUPPORTED_PROPERTIES = new Set(["color", "background-color"]);

/**
 * @param {string} css
 * @param {number} start
 */
function findStringEnd(css, start) {
  const quote = css[start];
  let i = start + 1;
  while (i < css.length) {
    const ch = css[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === quote) return i + 1;
    i += 1;
  }
  return css.length;
}

/**
 * Index after the `}` that closes the block starting at `start`.
 * @param {string} css
 * @param {number} start
 */
function findBlockEnd(css, start) {
  let depth = 1;
  let i = start;
  while (i < css.length) {
    const ch = css[i];
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end === -1 ? css.length : end + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = findStringEnd(css, i);
      continue;
    }
    if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
    i += 1;
  }
  return css.length;
}

/**
 * Split on `delim`, skipping nested strings and comments.
 * @param {string} str
 * @param {string} delim
 */
function splitTopLevel(str, delim) {
  const parts = [];
  let current = "";
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (ch === "/" && str[i + 1] === "*") {
      const end = str.indexOf("*/", i + 2);
      const stop = end === -1 ? str.length : end + 2;
      current += str.slice(i, stop);
      i = stop;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const stop = findStringEnd(str, i);
      current += str.slice(i, stop);
      i = stop;
      continue;
    }
    if (ch === delim) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
    i += 1;
  }
  parts.push(current);
  return parts;
}

/** @param {string} body */
function colorDeclarations(body) {
  return splitTopLevel(body, ";")
    .map((declaration) => {
      const colon = declaration.indexOf(":");
      if (colon === -1) return null;
      const prop = declaration.slice(0, colon).trim().toLowerCase();
      const value = declaration.slice(colon + 1).trim();
      return value && SUPPORTED_PROPERTIES.has(prop) ? { prop, value } : null;
    })
    .filter((declaration) => declaration !== null);
}

/**
 * @param {string} prelude Selector list preceding a rule's `{`.
 * @param {string} body Declarations between the matching `{` and `}`.
 */
function highlightRulesFor(prelude, body) {
  const declarations = colorDeclarations(body);
  if (declarations.length === 0) return "";
  const decl = declarations
    .map(({ prop, value }) => `${prop}:${value}`)
    .join(";");

  return splitTopLevel(prelude, ",")
    .map((selector) => SIMPLE_SCOPE_SELECTOR.exec(selector.trim()))
    .filter((match) => match !== null)
    .map((match) => `::highlight(hljs-${match[1]}){${decl}}`)
    .join("");
}

/**
 * @param {string} theme Theme CSS (optionally `<style>`-wrapped).
 * @returns {string} Converted `::highlight()` rules, concatenated.
 */
export function highlightRules(theme) {
  const match = STYLE_TAG.exec(theme);
  const css = match ? (match[2] ?? "") : theme;

  let out = "";
  let prelude = "";
  let i = 0;
  while (i < css.length) {
    const ch = css[i];
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end === -1 ? css.length : end + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const stop = findStringEnd(css, i);
      prelude += css.slice(i, stop);
      i = stop;
      continue;
    }
    if (ch === "{") {
      const bodyEnd = findBlockEnd(css, i + 1);
      if (!prelude.trim().startsWith("@")) {
        out += highlightRulesFor(prelude, css.slice(i + 1, bodyEnd));
      }
      prelude = "";
      i = bodyEnd + 1;
      continue;
    }
    if (ch === ";") {
      // Blockless at-rule (@import, etc.): nothing to convert.
      prelude = "";
      i += 1;
      continue;
    }
    prelude += ch;
    i += 1;
  }
  return out;
}
