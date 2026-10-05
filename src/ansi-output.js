/**
 * AnsiOutput's per-update pipeline: feed `text` into an incremental ANSI
 * session, then compute each segment's class and inline style for the
 * template. Split out of the component so it can be benched
 * (bench/ansi.bench.ts) and tested without a DOM.
 */

import { createAnsiSession } from "./ansi.js";
import { classNames, inlineStyle } from "./ansi-color.js";

/** @typedef {import("./ansi.d.ts").AnsiSegment} AnsiSegment */

/**
 * @typedef {{
 *   text: string;
 *   class: string | undefined;
 *   style: string | undefined;
 *   link: string | undefined;
 * }} RenderedAnsiSegment
 */

/**
 * @param {AnsiSegment} segment
 * @param {boolean} autoContrast
 * @returns {RenderedAnsiSegment}
 */
function render(segment, autoContrast) {
  return {
    text: segment.text,
    class: classNames(segment),
    style: inlineStyle(segment, autoContrast),
    link: segment.link,
  };
}

/**
 * @returns {{
 *   update: (text: string, autoContrast: boolean) => RenderedAnsiSegment[],
 * }}
 */
export function createAnsiOutput() {
  let session = createAnsiSession();
  // Prefix of `text` already fed to `session`. If `text` stops starting
  // with this, treat it as a restart (not an append) and re-parse fresh.
  let fedText = "";
  /** @type {RenderedAnsiSegment[]} */
  const rendered = [];
  /** @type {boolean | undefined} */
  let renderedContrast;

  return {
    /**
     * Returns the same array on every call, updated in place; entries for
     * unchanged segments keep their identity across calls.
     * @param {string} text
     * @param {boolean} autoContrast
     * @returns {RenderedAnsiSegment[]}
     */
    update(text, autoContrast) {
      // Re-parsing the whole string on every change is O(n^2) over a
      // growing (live-tailed or streamed) `text`, so only feed the new
      // suffix when `text` grows by a pure append; anything else gets a
      // fresh session.
      if (text.startsWith(fedText)) {
        if (text.length > fedText.length) {
          session.append(text.slice(fedText.length));
          fedText = text;
        }
      } else {
        session = createAnsiSession();
        session.append(text);
        fedText = text;
      }

      // Only the segments the session reports as changed get a fresh
      // class/style. Copying every segment and recomputing all of them
      // per chunk made a streamed 20,000-segment output quadratic
      // (bench/ansi.bench.ts, "repeated append: AnsiOutput update").
      let { start, segments } = session.delta();
      if (autoContrast !== renderedContrast) {
        // Every inline style depends on `autoContrast`; rebuild them all.
        renderedContrast = autoContrast;
        start = 0;
        segments = session.segments();
      }
      rendered.length = start;
      for (const segment of segments) {
        rendered.push(render(segment, autoContrast));
      }
      return rendered;
    },
  };
}
