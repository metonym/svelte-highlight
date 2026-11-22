import {
  findBlockEnd,
  findStringEnd,
  forEachRule,
  STYLE_TAG,
  splitTopLevel,
} from "./css-walk.js";

// At-rules whose body holds nested rules to scope.
const GROUP_AT_RULES = new Set([
  "media",
  "supports",
  "document",
  "container",
  "layer",
  "scope",
]);

const AT_RULE_NAME = /^@([a-zA-Z-]+)/;
const WHITESPACE = /\s/;
const WHITESPACE_RUN = /\s+/g;
const COMMENT = /\/\*[\s\S]*?\*\//g;

const VALID_SCOPE_TOKEN = /^-?[a-zA-Z_][\w-]*$/;

/** @param {string} scope */
function warnIfInvalidScope(scope) {
  if (typeof console !== "undefined" && !VALID_SCOPE_TOKEN.test(scope)) {
    console.warn(
      `[svelte-highlight/scoped] "${scope}" is not a single valid CSS class name; the scoped selector and any class attribute built from it may not match as expected.`,
    );
  }
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
      return `${prelude}{${rewriteRules(body, transform)}}`;
    }
    // @keyframes, @font-face: leave body alone.
    return `${prelude}{${body}}`;
  }
  return `${rewriteSelectorList(prelude, transform)}{${body}}`;
}

/**
 * @param {string} css
 * @param {(selector: string) => string} transform
 */
function rewriteRules(css, transform) {
  let out = "";
  // Prelude is sliced once from `preludeStart`, not built char by char.
  let preludeStart = 0;
  let i = 0;
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
      const bodyEnd = findBlockEnd(css, i + 1);
      out += rewriteBlock(
        css.slice(preludeStart, i),
        css.slice(i + 1, bodyEnd),
        transform,
      );
      i = bodyEnd + 1;
      preludeStart = i;
      continue;
    }
    if (ch === ";") {
      // Blockless at-rule (@import): emit as-is.
      i += 1;
      out += css.slice(preludeStart, i);
      preludeStart = i;
      continue;
    }
    i += 1;
  }
  return out + css.slice(preludeStart);
}

/**
 * @param {string} css Raw CSS (not `<style>`-wrapped).
 * @param {(selector: string) => string} transform
 * @returns {string}
 */
export function scopeSelectors(css, transform) {
  return rewriteRules(css, transform);
}

/**
 * @param {string} style Theme CSS (optionally `<style>`-wrapped).
 * @param {string} scope Class name without a leading `.`.
 * @param {string} [nonce]
 * @returns {string}
 */
export function scopeStyle(style, scope, nonce) {
  warnIfInvalidScope(scope);
  const body = scopedBody(style, scope);
  const match = STYLE_TAG.exec(style);
  if (!match) return body;
  if (nonce) return `<style nonce="${nonce}">${body}</style>`;
  return `${match[1] ?? ""}${body}${match[3] ?? ""}`;
}

const ROOT_SELECTORS = new Set([":root", ":host", "html"]);

/**
 * Bare scoped CSS (any `<style>` wrapper stripped).
 * @param {string} style
 * @param {string} scope
 * @param {string} [prefix]
 * @returns {string}
 */
function scopedBody(style, scope, prefix = "") {
  const scopeSelector = prefix ? `${prefix} .${scope}` : `.${scope}`;
  /** @type {(selector: string) => string} */
  const transform = (selector) =>
    // The scope stands in for the root: `.scope :root` would match nothing,
    // and the custom properties themes set there would never reach the code.
    ROOT_SELECTORS.has(selector.toLowerCase())
      ? scopeSelector
      : `${scopeSelector} ${selector}`;
  const match = STYLE_TAG.exec(style);
  const css = match ? (match[2] ?? "") : style;
  return scopeSelectors(css, transform);
}

/**
 * Each top-level selector in `style` (whitespace collapsed) to the
 * properties its rules declare.
 * @param {string} style
 * @returns {Map<string, Set<string>>}
 */
function declaredProperties(style) {
  /** @type {Map<string, Set<string>>} */
  const properties = new Map();
  forEachRule(style, (prelude, body) => {
    /** @type {string[]} */
    const names = [];
    for (const declaration of splitTopLevel(body, ";")) {
      const colon = declaration.indexOf(":");
      if (colon === -1) continue;
      const name = declaration.slice(0, colon).replace(COMMENT, "").trim();
      if (name === "") continue;
      names.push(name.startsWith("--") ? name : name.toLowerCase());
    }
    for (const selector of splitTopLevel(prelude, ",")) {
      const core = splitTrivia(selector)[1].replace(WHITESPACE_RUN, " ");
      if (core === "") continue;
      let set = properties.get(core);
      if (!set) {
        set = new Set();
        properties.set(core, set);
      }
      for (const name of names) set.add(name);
    }
  });
  return properties;
}

/**
 * The light rules apply in both modes, so under `mode`, before the dark
 * rules, unset each property a light rule declares that the dark theme
 * doesn't declare for the same selector: github's bold `.hljs-section`
 * mustn't stay bold under a dark theme that leaves it alone.
 * @param {string} light
 * @param {string} dark
 * @param {string} scope
 * @param {string} mode
 * @returns {string}
 */
function lightOnlyResets(light, dark, scope, mode) {
  const darkProperties = declaredProperties(dark);
  let css = "";
  for (const [selector, names] of declaredProperties(light)) {
    const dark = darkProperties.get(selector);
    const reset = [...names].filter((name) => !dark?.has(name));
    if (reset.length === 0) continue;
    css += `${mode} .${scope} ${selector}{${reset.map((name) => `${name}:unset`).join(";")}}`;
  }
  return css;
}

/**
 * @param {string} light
 * @param {string} dark
 * @param {string} scope
 * @param {string} [mode] `"auto"` | `"light"` | `"dark"` | a dark-gating selector.
 * @param {string} [nonce]
 * @returns {string}
 */
export function dualStyle(
  light,
  dark,
  scope,
  mode = "auto",
  nonce = undefined,
) {
  warnIfInvalidScope(scope);
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
    css =
      scopedBody(light, scope) +
      lightOnlyResets(light, dark, scope, mode) +
      scopedBody(dark, scope, mode);
  }
  const openTag = nonce ? `<style nonce="${nonce}">` : "<style>";
  return `${openTag}${css}</style>`;
}

/**
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
