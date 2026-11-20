/**
 * Wraps plain-text `ranges` of one highlighted line in `<span class>`. The
 * wrapper closes before every tag and reopens after it, so it stays the
 * innermost element and nesting stays valid.
 * @param {string} html one line of escaped, highlighted HTML
 * @param {Array<[number, number]>} ranges sorted, non-overlapping
 * @param {string} className
 */
export function overlayRanges(html, ranges, className) {
  if (ranges.length === 0) return html;
  const open = `<span class="${className}">`;
  let out = "";
  let pos = 0;
  let ri = 0;
  let inside = false;
  let i = 0;
  while (i < html.length) {
    const ch = html[i];
    if (ch === "<") {
      const end = html.indexOf(">", i) + 1;
      if (inside) {
        out += "</span>";
        inside = false;
      }
      out += html.slice(i, end);
      i = end;
      continue;
    }
    // An entity is one character of text.
    let len = 1;
    if (ch === "&") {
      const semi = html.indexOf(";", i);
      if (semi !== -1 && semi - i < 10) len = semi - i + 1;
    }
    while (
      ri < ranges.length &&
      pos >= /** @type {[number, number]} */ (ranges[ri])[1]
    )
      ri++;
    const range = ranges[ri];
    const want = range !== undefined && pos >= range[0] && pos < range[1];
    if (want !== inside) {
      out += want ? open : "</span>";
      inside = want;
    }
    out += html.slice(i, i + len);
    i += len;
    pos++;
  }
  if (inside) out += "</span>";
  return out;
}

/** @param {string} text */
export function escapeText(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
