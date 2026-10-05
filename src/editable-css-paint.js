/**
 * CSS Custom Highlight API paint helpers for HighlightEditable's
 * `"css-highlights"` engine, kept DOM-free so they can be benchmarked
 * (see css-paint.bench.ts).
 */

import { CLOSE, OPEN, TEXT, toRanges } from "./engine.js";

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
  // Rather than run `toRanges` over the whole document (one object per
  // token) and clip, walk to the line tracking only the open scopes and
  // the offset, then run `toRanges` over just the line: its scopes
  // reopened, then its events with the first and last text cut to the
  // line. css-paint.bench.ts: ~4x faster at a mid-document line, ~1.8x
  // at the last line, and O(line) instead of O(document) at the first.
  /** @type {ScopeEvent[]} */
  const line = [];
  let offset = 0;
  let i = 0;
  for (; i < events.length; i++) {
    const event = /** @type {ScopeEvent} */ (events[i]);
    if (event.t === OPEN) line.push(event);
    else if (event.t === CLOSE) line.pop();
    else if (offset + event.v.length > lineStart) break;
    else offset += event.v.length;
  }
  for (; i < events.length && offset < lineEnd; i++) {
    const event = /** @type {ScopeEvent} */ (events[i]);
    if (event.t !== TEXT) {
      line.push(event);
      continue;
    }
    const length = event.v.length;
    line.push(
      offset >= lineStart && offset + length <= lineEnd
        ? event
        : {
            t: TEXT,
            v: event.v.slice(
              Math.max(lineStart - offset, 0),
              Math.min(lineEnd - offset, length),
            ),
          },
    );
    offset += length;
  }
  return toRanges(line);
}
