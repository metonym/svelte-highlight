/**
 * Scope highlight.js theme CSS under a class.
 * Used by HighlightStyle and the docs styles build.
 */

// @media, @supports, etc.: recurse into the block body.
const GROUP_AT_RULES = new Set([
  "media",
  "supports",
  "document",
  "container",
  "layer",
  "scope",
]);

const STYLE_TAG = /^(\s*<style>)([\s\S]*?)(<\/style>\s*)$/;
const AT_RULE_NAME = /^@([a-zA-Z-]+)/;
const WHITESPACE = /\s/;

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
 * Split on `delim`, skipping nested `()`, `[]`, strings, and comments.
 * @param {string} str
 * @param {string} delim
 */
function splitTopLevel(str, delim) {
  const parts = [];
  let depth = 0;
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
    if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") depth -= 1;

    if (ch === delim && depth === 0) {
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

/**
 * @param {string} selector
 * @returns {[string, string, string]} `[leading, core, trailing]`
 */
function splitTrivia(selector) {
  let start = 0;
  while (start < selector.length) {
    const ch = selector[start];
    if (ch === undefined) break;
    if (ch === "/" && selector[start + 1] === "*") {
      const end = selector.indexOf("*/", start + 2);
      start = end === -1 ? selector.length : end + 2;
      continue;
    }
    if (WHITESPACE.test(ch)) {
      start += 1;
      continue;
    }
    break;
  }
  let end = selector.length;
  while (end > start) {
    const ch = selector[end - 1];
    if (ch !== undefined && WHITESPACE.test(ch)) {
      end -= 1;
      continue;
    }
    break;
  }
  return [
    selector.slice(0, start),
    selector.slice(start, end),
    selector.slice(end),
  ];
}

/**
 * @param {string} selectorList
 * @param {(selector: string) => string} transform
 */
function rewriteSelectorList(selectorList, transform) {
  return splitTopLevel(selectorList, ",")
    .map((selector) => {
      const [leading, core, trailing] = splitTrivia(selector);
      // Whitespace/comments only.
      if (core === "") return selector;
      return `${leading}${transform(core)}${trailing}`;
    })
    .join(",");
}

/**
 * @param {string} prelude Text preceding a `{` (selector list or at-rule).
 * @param {string} body Text between the matching `{` and `}`.
 * @param {(selector: string) => string} transform
 */
function rewriteBlock(prelude, body, transform) {
  const trimmed = prelude.trim();
  if (trimmed.startsWith("@")) {
    const match = AT_RULE_NAME.exec(trimmed);
    const name = match?.[1]?.toLowerCase() ?? "";
    if (GROUP_AT_RULES.has(name)) {
      // @media etc.: scope nested rules.
      return `${prelude}{${rewriteRules(body, transform)}}`;
    }
    // @keyframes, @font-face: leave body alone.
    return `${prelude}{${body}}`;
  }
  return `${rewriteSelectorList(prelude, transform)}{${body}}`;
}

/**
 * Walk CSS rules and run `transform` on each selector.
 * @param {string} css
 * @param {(selector: string) => string} transform
 */
function rewriteRules(css, transform) {
  let out = "";
  let prelude = "";
  let i = 0;
  while (i < css.length) {
    const ch = css[i];
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      const stop = end === -1 ? css.length : end + 2;
      prelude += css.slice(i, stop);
      i = stop;
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
      out += rewriteBlock(prelude, css.slice(i + 1, bodyEnd), transform);
      prelude = "";
      i = bodyEnd + 1;
      continue;
    }
    if (ch === ";") {
      // Blockless at-rule (@import): emit as-is.
      out += prelude + ch;
      prelude = "";
      i += 1;
      continue;
    }
    prelude += ch;
    i += 1;
  }
  return out + prelude;
}

/**
 * Walk CSS and rewrite each selector with `transform`.
 *
 * @param {string} css Raw CSS (not `<style>`-wrapped).
 * @param {(selector: string) => string} transform
 * @returns {string}
 */
export function scopeSelectors(css, transform) {
  return rewriteRules(css, transform);
}

/**
 * Prefix theme selectors with `.<scope> `. Keeps a `<style>` wrapper when present.
 *
 * @param {string} style Theme CSS (optionally `<style>`-wrapped).
 * @param {string} scope Scope class name without a leading `.`.
 * @returns {string}
 */
export function scopeStyle(style, scope) {
  const body = scopedBody(style, scope);
  const match = STYLE_TAG.exec(style);
  return match ? `${match[1] ?? ""}${body}${match[3] ?? ""}` : body;
}

/**
 * Scope under `.scope`, strip any `<style>` wrapper, return bare CSS.
 * @param {string} style
 * @param {string} scope
 * @param {string} [prefix]
 * @returns {string}
 */
function scopedBody(style, scope, prefix = "") {
  const scopeSelector = prefix ? `${prefix} .${scope}` : `.${scope}`;
  /** @type {(selector: string) => string} */
  const transform = (selector) => `${scopeSelector} ${selector}`;
  const match = STYLE_TAG.exec(style);
  const css = match ? (match[2] ?? "") : style;
  return scopeSelectors(css, transform);
}

/**
 * Build a combined light/dark stylesheet scoped under `.scope`.
 *
 * - `"auto"` wraps each theme in `@media (prefers-color-scheme: …)`.
 * - `"light"` / `"dark"` emit only that single theme.
 * - any other string is treated as a CSS selector that gates the dark block
 *   (light stays the default), e.g. `[data-theme="dark"]`.
 *
 * @param {string} light Light theme CSS (optionally `<style>`-wrapped).
 * @param {string} dark Dark theme CSS (optionally `<style>`-wrapped).
 * @param {string} scope Scope class name without a leading `.`.
 * @param {string} [mode] `"auto"` | `"light"` | `"dark"` | a CSS selector.
 * @returns {string}
 */
export function dualStyle(light, dark, scope, mode = "auto") {
  let css;
  if (mode === "light") {
    css = scopedBody(light, scope);
  } else if (mode === "dark") {
    css = scopedBody(dark, scope);
  } else if (mode === "auto") {
    css =
      `@media (prefers-color-scheme: light){${scopedBody(light, scope)}}` +
      `@media (prefers-color-scheme: dark){${scopedBody(dark, scope)}}`;
  } else {
    css = scopedBody(light, scope) + scopedBody(dark, scope, mode);
  }
  return `<style>${css}</style>`;
}

/**
 * Hash of the theme string. Same theme gives the same class (SSR-safe).
 *
 * @param {string} theme
 * @param {string} [prefix]
 * @returns {string}
 */
export function scopeClassFor(theme, prefix = "svh-scope") {
  let hash = 0;
  for (let i = 0; i < theme.length; i += 1) {
    hash = (Math.imul(31, hash) + theme.charCodeAt(i)) | 0;
  }
  return `${prefix}-${(hash >>> 0).toString(36)}`;
}
