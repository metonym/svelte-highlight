/**
 * CSS Custom Highlight API paint helpers for HighlightEditable's
 * `"css-highlights"` engine, kept DOM-free so they can be benchmarked
 * (see css-paint.bench.ts).
 */

import { toRanges } from "./engine.js";

/**
 * @typedef {import("./engine.d.ts").ScopeEvent} ScopeEvent
 * @typedef {import("./engine.d.ts").TokenRange} TokenRange
 */

/**
 * The token ranges painted on one line, `[lineStart, lineEnd)` in document
 * offsets, as offsets relative to `lineStart` - what a single-line repaint
 * registers against that line's text node. Same ranges as `toRanges(events)`
 * clipped to the line, with empty clips dropped.
 * @param {ScopeEvent[]} events
 * @param {number} lineStart
 * @param {number} lineEnd
 * @returns {TokenRange[]}
 */
export function lineTokenRanges(events, lineStart, lineEnd) {
  const tokenRanges = toRanges(events);
  /** @type {TokenRange[]} */
  const ranges = [];
  // `tokenRanges` is sorted by, and disjoint on, `start`, so `end` is
  // monotonically increasing too. Binary-search the first range that can
  // possibly intersect the line instead of scanning the whole document.
  let lo = 0;
  let hi = tokenRanges.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (/** @type {TokenRange} */ (tokenRanges[mid]).end <= lineStart) {
      lo = mid + 1;
    } else hi = mid;
  }
  for (
    let j = lo;
    j < tokenRanges.length &&
    /** @type {TokenRange} */ (tokenRanges[j]).start < lineEnd;
    j++
  ) {
    const token = /** @type {TokenRange} */ (tokenRanges[j]);
    const start = Math.max(token.start, lineStart) - lineStart;
    const end = Math.min(token.end, lineEnd) - lineStart;
    if (start === end) continue;
    ranges.push({ start, end, scope: token.scope });
  }
  return ranges;
}
