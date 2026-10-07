/** Incremental line-HTML paint for HighlightEditable's `"dom"` engine. */

import { CLOSE, extendLines, OPEN, renderHtml, TEXT } from "./engine.js";
import { sharedEvents } from "./incremental-tokenize.js";
import { splitLines } from "./split-lines.js";

/**
 * @typedef {import("./engine.d.ts").ScopeEvent} ScopeEvent
 * @typedef {import("./incremental-tokenize.js").EventReuse} EventReuse
 */

/**
 * Full line-HTML paint, plus the editor's phantom empty line when `code` is
 * empty or ends in "\n".
 * @param {ScopeEvent[]} events
 * @param {string} code
 * @returns {string[]}
 */
export function lineHtmlFromEvents(events, code) {
  const html = renderHtml(events);
  const paintHtml = code === "" || code.endsWith("\n") ? `${html}\n` : html;
  return splitLines(paintHtml);
}

/**
 * @param {string} code
 * @param {number} from
 * @param {number} end
 */
function countNewlines(code, from, end) {
  let count = 0;
  for (let i = code.indexOf("\n", from); i !== -1 && i < end; ) {
    count++;
    i = code.indexOf("\n", i + 1);
  }
  return count;
}

/**
 * Walk state after the first `index` events of `events`, reusable by a later
 * `patchLineHtml` whose `prevEvents` is `events` while `index` stays in the
 * unchanged prefix.
 * @typedef {{
 *   events: ScopeEvent[] | undefined,
 *   index: number,
 *   stack: string[],
 *   offset: number,
 *   newlines: number,
 * }} PatchMemo
 */

/** @returns {PatchMemo} */
function createPatchMemo() {
  return { events: undefined, index: 0, stack: [], offset: 0, newlines: 0 };
}

/**
 * Same result as `lineHtmlFromEvents(events, code)`, given `prevLines` =
 * `lineHtmlFromEvents(prevEvents, prevCode)`, but re-renders only the lines
 * whose events changed and reuses `prevLines`' strings for the rest.
 *
 * Unchanged events are shared by identity (`reparseIncremental`), and a
 * line's HTML depends only on its events plus the scopes open at its start,
 * so lines before the first changed event, and after the first "\n" in the
 * shared suffix (if the same scopes are open there), are kept.
 *
 * `memo` resumes the walk to the first changed line across calls; `reuse`
 * (when its `from` is `prevEvents`) avoids an O(document) array compare.
 *
 * @param {ScopeEvent[]} prevEvents
 * @param {string[]} prevLines
 * @param {ScopeEvent[]} events
 * @param {string} code
 * @param {PatchMemo} [memo]
 * @param {EventReuse} [reuse]
 * @returns {string[]}
 */
export function patchLineHtml(
  prevEvents,
  prevLines,
  events,
  code,
  memo,
  reuse,
) {
  if (events === prevEvents) return prevLines;
  const prevCount = prevEvents.length;
  const count = events.length;
  const { prefix, suffix } = sharedEvents(prevEvents, events, reuse);
  if (prefix === prevCount && prefix === count) return prevLines;

  // The first changed line starts after the last "\n" before `prefix`.
  let breakEvent = prefix - 1;
  let breakAt = -1;
  for (; breakEvent >= 0; breakEvent--) {
    const event = /** @type {ScopeEvent} */ (events[breakEvent]);
    if (event.t === TEXT) {
      breakAt = event.v.lastIndexOf("\n");
      if (breakAt !== -1) break;
    }
  }

  // Scopes open at that line's start and its offset into `code`.
  const resume =
    memo !== undefined && memo.events === prevEvents && memo.index <= breakEvent
      ? memo
      : undefined;
  /** @type {string[]} */
  const stack = resume ? resume.stack.slice() : [];
  const walkFrom = resume ? resume.offset : 0;
  let offset = walkFrom;
  for (let i = resume ? resume.index : 0; i < breakEvent; i++) {
    const event = /** @type {ScopeEvent} */ (events[i]);
    if (event.t === OPEN) stack.push(event.s);
    else if (event.t === CLOSE) stack.pop();
    else offset += event.v.length;
  }
  let firstLine = 0;
  if (breakEvent >= 0) {
    const newlines =
      (resume ? resume.newlines : 0) + countNewlines(code, walkFrom, offset);
    firstLine = newlines + countNewlines(code, offset, offset + breakAt + 1);
    if (memo !== undefined) {
      memo.events = events;
      memo.index = breakEvent;
      memo.stack = stack.slice();
      memo.offset = offset;
      memo.newlines = newlines;
    }
  }

  // Re-render from the line start: reopen its scopes, then its text.
  /** @type {ScopeEvent[]} */
  const region = stack.map((s) => ({ t: OPEN, s }));
  if (breakEvent >= 0) {
    const event = /** @type {{ v: string }} */ (events[breakEvent]);
    region.push({ t: TEXT, v: event.v.slice(breakAt + 1) });
  }

  // The first "\n" in the common suffix ends the last line to re-render.
  let endEvent = count - suffix;
  let endAt = -1;
  for (; endEvent < count; endEvent++) {
    const event = /** @type {ScopeEvent} */ (events[endEvent]);
    if (event.t === TEXT) {
      endAt = event.v.indexOf("\n");
      if (endAt !== -1) break;
    }
  }

  if (endAt !== -1) {
    for (let i = breakEvent + 1; i < endEvent; i++) {
      region.push(/** @type {ScopeEvent} */ (events[i]));
    }
    const event = /** @type {{ v: string }} */ (events[endEvent]);
    region.push({ t: TEXT, v: event.v.slice(0, endAt + 1) });
    const rendered = extendLines(region, [], "");

    // Walk the old side of the same span: the scopes open at that "\n",
    // and how many old lines the re-rendered ones replace.
    const prevStack = stack.slice();
    let prevLineCount = 1;
    const prevEndEvent = endEvent - count + prevCount;
    for (let i = breakEvent + 1; i < prevEndEvent; i++) {
      const prev = /** @type {ScopeEvent} */ (prevEvents[i]);
      if (prev.t === OPEN) prevStack.push(prev.s);
      else if (prev.t === CLOSE) prevStack.pop();
      else prevLineCount += countNewlines(prev.v, 0, prev.v.length);
    }

    const openScopes = rendered.openScopes;
    let sameScopes = openScopes.length === prevStack.length;
    for (let i = 0; sameScopes && i < openScopes.length; i++) {
      sameScopes = openScopes[i] === prevStack[i];
    }
    if (sameScopes) {
      return prevLines
        .slice(0, firstLine)
        .concat(
          rendered.completedLines,
          prevLines.slice(firstLine + prevLineCount),
        );
    }
    // Different scopes reach the tail: re-render through the end instead.
    region.length = stack.length + (breakEvent >= 0 ? 1 : 0);
  }

  for (let i = breakEvent + 1; i < count; i++) {
    region.push(/** @type {ScopeEvent} */ (events[i]));
  }
  const rendered = extendLines(region, [], "");
  const lines = prevLines
    .slice(0, firstLine)
    .concat(rendered.completedLines, [rendered.pendingHtml]);
  if (code === "" || code.endsWith("\n")) lines.push(""); // phantom line
  return lines;
}

/**
 * Stateful line-HTML painter: full render on the first paint and after a
 * language change, `patchLineHtml` otherwise.
 */
export function createDomLinePainter() {
  let language = "";
  /** @type {ScopeEvent[] | undefined} */
  let prevEvents;
  /** @type {string[]} */
  let prevLines = [];
  const memo = createPatchMemo();

  return {
    reset() {
      language = "";
      prevEvents = undefined;
      prevLines = [];
      Object.assign(memo, createPatchMemo());
    },
    /**
     * @param {ScopeEvent[]} events
     * @param {string} code
     * @param {string} languageName
     * @param {EventReuse} [reuse]
     * @returns {string[]}
     */
    paint(events, code, languageName, reuse) {
      prevLines =
        prevEvents === undefined || languageName !== language
          ? lineHtmlFromEvents(events, code)
          : patchLineHtml(prevEvents, prevLines, events, code, memo, reuse);
      prevEvents = events;
      language = languageName;
      return prevLines;
    },
  };
}
