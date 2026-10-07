/** DOM-free paint helpers for HighlightEditable's `"css-highlights"` engine. */

import { CLOSE, OPEN, TEXT, toRanges } from "./engine.js";
import { sharedEvents } from "./incremental-tokenize.js";

/**
 * @typedef {import("./engine.d.ts").ScopeEvent} ScopeEvent
 * @typedef {import("./engine.d.ts").TokenRange} TokenRange
 * @typedef {import("./incremental-tokenize.js").EventReuse} EventReuse
 */

/**
 * `toRanges(events)` clipped to `[lineStart, lineEnd)`, relative to
 * `lineStart`, with empty clips dropped.
 * @param {ScopeEvent[]} events
 * @param {number} lineStart
 * @param {number} lineEnd
 * @returns {TokenRange[]}
 */
export function lineTokenRanges(events, lineStart, lineEnd) {
  // Perf: walk to the line tracking only open scopes, then run `toRanges`
  // over just the line's events instead of over the whole document.
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

/**
 * End offset of the lines whose ranges may have changed after an edit at
 * `from`: the "\n" ending the line where `events` rejoin `previousEvents`
 * with the same scopes open, else `code.length`. Later lines are unchanged.
 * @param {string} code
 * @param {ScopeEvent[]} events
 * @param {ScopeEvent[] | undefined} previousEvents
 * @param {EventReuse | undefined} reuse
 * @param {number} from
 * @returns {number}
 */
export function retokenizedEnd(code, events, previousEvents, reuse, from) {
  if (previousEvents === undefined) return code.length;
  const { prefix, suffix } = sharedEvents(previousEvents, events, reuse);
  if (suffix === 0) return code.length;

  // The shared prefix opens the same scopes on both sides: walk it once.
  /** @type {string[]} */
  const scopes = [];
  let offset = 0;
  for (let i = 0; i < prefix; i++) {
    const event = /** @type {ScopeEvent} */ (events[i]);
    if (event.t === OPEN) scopes.push(event.s);
    else if (event.t === CLOSE) scopes.pop();
    else offset += event.v.length;
  }
  const prevScopes = scopes.slice();
  for (let i = prefix; i < events.length - suffix; i++) {
    const event = /** @type {ScopeEvent} */ (events[i]);
    if (event.t === OPEN) scopes.push(event.s);
    else if (event.t === CLOSE) scopes.pop();
    else offset += event.v.length;
  }
  for (let i = prefix; i < previousEvents.length - suffix; i++) {
    const event = /** @type {ScopeEvent} */ (previousEvents[i]);
    if (event.t === OPEN) prevScopes.push(event.s);
    else if (event.t === CLOSE) prevScopes.pop();
  }
  if (
    scopes.length !== prevScopes.length ||
    scopes.some((scope, i) => scope !== prevScopes[i])
  ) {
    return code.length;
  }

  const newline = code.indexOf("\n", Math.max(offset, from));
  return newline === -1 ? code.length : newline;
}
