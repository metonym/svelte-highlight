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

/**
 * Renders `units` into HTML once: tags pass through unchanged, each visible
 * unit is wrapped in a `typewriter-unit typewriter-hidden` span so
 * `Typewriter` can reveal them one at a time without touching the DOM tree
 * shape again until `units` itself changes.
 * @param {TypewriterUnit[]} units
 * @returns {string}
 */
export function buildUnitMarkup(units) {
  let html = "";
  for (const unit of units) {
    html +=
      unit.visible === 0
        ? unit.raw
        : `<span class="typewriter-unit typewriter-hidden">${unit.raw}</span>`;
  }
  return html;
}

/**
 * @typedef {Object} TypewriterSplitter
 * @property {(count: number) => { head: string; tail: string }} splitAt
 */

/**
 * Stateful incremental version of the old `split(units, count)`: since
 * `units[i].raw` are contiguous, non-overlapping slices exactly partitioning
 * `html` (see `tokenizeTypewriter`), the concatenation of `units[0..i).raw`
 * equals `html.slice(0, rawOffset)` for the matching `rawOffset`, so `head`
 * can be built with a single slice instead of repeated concatenation. A
 * cursor (`i`, `shown`, `rawOffset`, open-tag stack) is kept between calls
 * and only ever advances, so a monotonically increasing sequence of
 * `splitAt(count)` calls costs O(n) total instead of O(n^2). A `count` lower
 * than the last one served resets the cursor and replays from zero.
 * @param {TypewriterUnit[]} units
 * @param {string} html
 * @returns {TypewriterSplitter}
 */
export function createTypewriterSplitter(units, html) {
  let i = 0;
  let shown = 0;
  let rawOffset = 0;
  /** @type {{ raw: string; name: string }[]} */
  let open = [];
  let lastCount = 0;

  function reset() {
    i = 0;
    shown = 0;
    rawOffset = 0;
    open = [];
  }

  /**
   * @param {number} count
   * @returns {{ head: string; tail: string }}
   */
  function splitAt(count) {
    if (count < lastCount) reset();
    lastCount = count;

    for (; i < units.length; i++) {
      const unit = /** @type {TypewriterUnit} */ (units[i]);
      if (shown >= count) break;
      rawOffset += unit.raw.length;
      if (unit.visible === 0) {
        if (unit.kind === "open")
          open.push({ raw: unit.raw, name: unit.name ?? "" });
        else if (unit.kind === "close") open.pop();
      } else {
        shown += unit.visible;
      }
    }

    let headClose = "";
    for (let k = open.length - 1; k >= 0; k--)
      headClose += `</${/** @type {{ raw: string; name: string }} */ (open[k]).name}>`;

    let tail = "";
    for (const tag of open) tail += tag.raw;
    tail += html.slice(rawOffset);

    return { head: html.slice(0, rawOffset) + headClose, tail };
  }

  return { splitAt };
}
