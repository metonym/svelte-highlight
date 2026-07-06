/** Opening or closing tag name. */
const TAG_NAME = /^<\/?\s*([a-zA-Z0-9-]+)/;

/**
 * @typedef {Object} TypewriterUnit
 * @property {string} raw
 * @property {0 | 1} visible
 * @property {"open" | "close" | "self"} [kind]
 * @property {string} [name]
 */

/**
 * Splits highlight.js output HTML into typing units for `Typewriter`. A unit
 * is either an HTML tag (zero visible chars, never split) or one visible
 * character: a plain character, a full surrogate pair (so a 4-byte emoji is
 * never split mid-codepoint), or a single HTML entity such as `&amp;` (one
 * visible char across several raw bytes).
 * @param {string} html
 * @returns {TypewriterUnit[]}
 */
export function tokenizeTypewriter(html) {
  /** @type {TypewriterUnit[]} */
  const units = [];
  const n = html.length;
  let i = 0;

  while (i < n) {
    const ch = html[i];

    if (ch === "<") {
      const end = html.indexOf(">", i);
      if (end === -1) {
        // Unclosed tag: treat as text.
        units.push({ raw: html.slice(i), visible: 1 });
        break;
      }
      const raw = html.slice(i, end + 1);
      const kind =
        raw[1] === "/"
          ? "close"
          : raw[raw.length - 2] === "/"
            ? "self"
            : "open";
      const match = TAG_NAME.exec(raw);
      units.push({
        raw,
        visible: 0,
        kind,
        name: match ? (match[1] ?? "") : "",
      });
      i = end + 1;
    } else if (ch === "&") {
      // One visible char per entity.
      const end = html.indexOf(";", i);
      if (end !== -1 && end - i <= 10) {
        units.push({ raw: html.slice(i, end + 1), visible: 1 });
        i = end + 1;
      } else {
        units.push({ raw: ch, visible: 1 });
        i += 1;
      }
    } else {
      // A surrogate pair (e.g. most emoji) is one codepoint, one unit --
      // splitting it across two ticks would render an orphan half.
      const codePoint = html.codePointAt(i) ?? 0;
      const length = codePoint > 0xffff ? 2 : 1;
      units.push({ raw: html.slice(i, i + length), visible: 1 });
      i += length;
    }
  }

  return units;
}
