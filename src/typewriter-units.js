const TAG_NAME = /^<\/?\s*([a-zA-Z0-9-]+)/;

/**
 * @typedef {Object} TypewriterUnit
 * @property {string} raw
 * @property {0 | 1} visible
 * @property {"open" | "close" | "self"} [kind]
 * @property {string} [name]
 */

/**
 * @param {string} html
 * @returns {TypewriterUnit[]}
 */
export function tokenizeTypewriter(html) {
  /** @type {TypewriterUnit[]} */
  const units = [];
  const n = html.length;
  let i = 0;

  while (i < n) {
    // charCodeAt avoids allocating a 1-char string per position.
    const code = html.charCodeAt(i);

    if (code === 60 /* "<" */) {
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
    } else if (code === 38 /* "&" */) {
      const end = html.indexOf(";", i);
      if (end !== -1 && end - i <= 10) {
        units.push({ raw: html.slice(i, end + 1), visible: 1 });
        i = end + 1;
      } else {
        units.push({ raw: html.charAt(i), visible: 1 });
        i += 1;
      }
    } else {
      // Keep surrogate pairs together so an emoji never renders half.
      const codePoint = html.codePointAt(i) ?? 0;
      const length = codePoint > 0xffff ? 2 : 1;
      units.push({ raw: html.slice(i, i + length), visible: 1 });
      i += length;
    }
  }

  return units;
}

/**
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
 * Units exactly partition `html`, so `head` is a single slice up to
 * `rawOffset`. The cursor only advances; a lower `count` replays from zero.
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

const WHITESPACE = new Set([" ", "\t", "\r", "\n"]);

/**
 * @param {TypewriterUnit[]} units
 * @returns {number[]}
 */
export function computeWordBoundaries(units) {
  /** @type {number[]} */
  const boundaries = [];
  let count = 0;
  let inWhitespaceRun = false;

  for (const unit of units) {
    if (unit.visible === 0) continue;
    count++;

    if (WHITESPACE.has(unit.raw)) {
      inWhitespaceRun = true;
    } else if (inWhitespaceRun) {
      boundaries.push(count - 1);
      inWhitespaceRun = false;
    }
  }

  if (count > 0) boundaries.push(count);

  return boundaries;
}
