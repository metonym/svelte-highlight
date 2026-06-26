/**
 * Scope highlight.js theme CSS under a class name.
 * Used by `HighlightStyle` and the docs styles build.
 */

// At-rules whose bodies contain nested style rules and must be recursed into.
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
 * Returns the index just past a string literal starting at `start`.
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
 * Returns the index of the `}` that closes the block whose contents begin at
 * `start`, accounting for nested blocks, comments and strings.
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
 * Splits a string on a top-level delimiter, ignoring delimiters nested inside
 * parentheses, brackets, strings or comments (e.g. commas in `:not(a, b)`).
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
 * Splits a single selector into leading trivia (whitespace/comments), its
 * significant core, and trailing whitespace, so a transform only sees the core.
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
      // Empty or whitespace/comments-only. Leave untouched.
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
      // Conditional group rule (e.g. @media): scope the nested rules.
      return `${prelude}{${rewriteRules(body, transform)}}`;
    }
    // @keyframes, @font-face, @page, etc. Do not scope the body.
    return `${prelude}{${body}}`;
  }
  return `${rewriteSelectorList(prelude, transform)}{${body}}`;
}

/**
 * Walks a sequence of CSS rules, applying `transform` to each individual
 * selector of every style rule while preserving comments, strings and
 * at-rules (descending into conditional group rules like `@media`).
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
      // Statement at-rule without a block (e.g. `@import`); emit unchanged.
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
  const scopeSelector = `.${scope}`;
  /** @type {(selector: string) => string} */
  const transform = (selector) => `${scopeSelector} ${selector}`;
  const match = STYLE_TAG.exec(style);
  if (match) {
    const open = match[1] ?? "";
    const css = match[2] ?? "";
    const close = match[3] ?? "";
    return `${open}${scopeSelectors(css, transform)}${close}`;
  }
  return scopeSelectors(style, transform);
}

/**
 * Scope `style` under `.scope`, optionally prefixing every selector with an
 * extra `prefix` (e.g. a mode selector), and return the bare CSS with any
 * `<style>` wrapper removed so callers can recombine it.
 *
 * @param {string} style Theme CSS (optionally `<style>`-wrapped).
 * @param {string} scope Scope class name without a leading `.`.
 * @param {string} [prefix] Selector prepended ahead of the scope class.
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
