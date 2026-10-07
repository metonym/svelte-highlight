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
