// CSS string/comment/block scanning shared by scoped.js and highlight-theme.js.

export const STYLE_TAG = /^(\s*<style>)([\s\S]*?)(<\/style>\s*)$/;

/**
 * Index after the closing quote of the string starting at `start`.
 * @param {string} css
 * @param {number} start
 */
export function findStringEnd(css, start) {
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
 * Index of the `}` closing the block whose body starts at `start`.
 * @param {string} css
 * @param {number} start
 */
export function findBlockEnd(css, start) {
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
export function splitTopLevel(str, delim) {
  const parts = [];
  let depth = 0;
  // Parts are sliced once from `partStart`, not built char by char.
  let partStart = 0;
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (ch === "/" && str[i + 1] === "*") {
      const end = str.indexOf("*/", i + 2);
      i = end === -1 ? str.length : end + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = findStringEnd(str, i);
      continue;
    }
    if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") depth -= 1;

    if (ch === delim && depth === 0) {
      parts.push(str.slice(partStart, i));
      partStart = i + 1;
    }
    i += 1;
  }
  parts.push(str.slice(partStart));
  return parts;
}

/**
 * Calls `visit(prelude, body)` for each top-level style rule in `css`, in
 * source order. At-rules (`@media`, `@import`, ...) are skipped. A
 * `<style>` wrapper is stripped first.
 * @param {string} css
 * @param {(prelude: string, body: string) => void} visit
 */
export function forEachRule(css, visit) {
  const match = STYLE_TAG.exec(css);
  const source = match ? (match[2] ?? "") : css;

  // Prelude is built from slices between comments, not char by char.
  let prelude = "";
  let runStart = 0;
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === "/" && source[i + 1] === "*") {
      prelude += source.slice(runStart, i);
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? source.length : end + 2;
      runStart = i;
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = findStringEnd(source, i);
      continue;
    }
    if (ch === "{") {
      prelude += source.slice(runStart, i);
      const bodyEnd = findBlockEnd(source, i + 1);
      if (!prelude.trim().startsWith("@")) {
        visit(prelude, source.slice(i + 1, bodyEnd));
      }
      prelude = "";
      i = bodyEnd + 1;
      runStart = i;
      continue;
    }
    if (ch === ";") {
      // Blockless at-rule (@import, etc.).
      prelude = "";
      i += 1;
      runStart = i;
      continue;
    }
    i += 1;
  }
}

const SPACE = /\s/;

/**
 * Index of the `)` matching the `(` just before `start`, skipping strings.
 * @param {string} value
 * @param {number} start
 */
function closingParen(value, start) {
  let depth = 1;
  for (let i = start; i < value.length; i++) {
    const ch = value[i];
    if (ch === "(") depth++;
    else if (ch === ")" && --depth === 0) return i;
  }
  return -1;
}

/**
 * Replaces each `var(--name, fallback)` in `value`. `null` when a reference
 * has no value and no fallback: the declaration is then invalid at
 * computed-value time and behaves as `unset`.
 * @param {string} value
 * @param {(name: string) => string | undefined} lookup
 * @returns {string | null}
 */
export function substituteVars(value, lookup) {
  let out = "";
  let i = 0;
  for (;;) {
    const start = value.toLowerCase().indexOf("var(", i);
    if (start === -1) return out + value.slice(i);
    const end = closingParen(value, start + 4);
    if (end === -1) return null;
    const inner = value.slice(start + 4, end);
    const comma = splitTopLevel(inner, ",");
    const name = (comma[0] ?? "").trim();
    const fallback =
      comma.length > 1 ? inner.slice(inner.indexOf(",") + 1) : undefined;
    let replacement = lookup(name);
    if (replacement === undefined && fallback !== undefined) {
      const resolved = substituteVars(fallback, lookup);
      if (resolved === null) return null;
      replacement = resolved;
    }
    if (replacement === undefined) return null;
    out += value.slice(i, start) + replacement;
    i = end + 1;
  }
}

const BACKGROUND_KEYWORDS = new Set([
  "none",
  "repeat",
  "repeat-x",
  "repeat-y",
  "no-repeat",
  "space",
  "round",
  "scroll",
  "fixed",
  "local",
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "border-box",
  "padding-box",
  "content-box",
  "text",
  "auto",
  "cover",
  "contain",
]);
const IMAGE_FUNCTION =
  /^(url|image|image-set|cross-fade|element|paint|(repeating-)?(linear|radial|conic)-gradient)\(/i;
const LENGTH_LIKE = /^[-+.\d]/;

/**
 * Splits on top-level whitespace and `/`, keeping functions whole.
 * @param {string} value
 */
function shorthandTokens(value) {
  /** @type {string[]} */
  const tokens = [];
  let depth = 0;
  let current = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (depth === 0 && (ch === "/" || SPACE.test(ch))) {
      if (current) tokens.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

/**
 * The `background-color` a `background` shorthand sets: its final layer's
 * color, or `transparent` when it names none.
 * @param {string} value
 */
export function shorthandBackgroundColor(value) {
  const layers = splitTopLevel(value, ",");
  const last = layers[layers.length - 1] ?? "";
  for (const token of shorthandTokens(last)) {
    const lower = token.toLowerCase();
    if (BACKGROUND_KEYWORDS.has(lower)) continue;
    if (IMAGE_FUNCTION.test(token) || LENGTH_LIKE.test(token)) continue;
    return token;
  }
  return "transparent";
}
