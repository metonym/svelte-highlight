/**
 * Incremental DOM-engine paint helpers for HighlightEditable.
 *
 * Tokenization via `reparseIncremental` is already incremental, but the
 * default `"dom"` engine still ran `renderHtml` + `splitLines` over the full
 * event stream every keystroke. Now only the first paint does; every edit
 * after it, append or mid-document, re-renders only the lines whose events
 * changed (`patchLineHtml`).
 */

import { CLOSE, extendLines, OPEN, renderHtml, TEXT } from "./engine.js";
import { splitLines } from "./split-lines.js";

/**
 * Full line-HTML paint via `renderHtml` + `splitLines` (the historical path).
 * @param {import("./engine.d.ts").ScopeEvent[]} events
 * @param {string} code
 * @returns {string[]}
 */
export function lineHtmlFromEvents(events, code) {
  const html = renderHtml(events);
  const paintHtml = code === "" || code.endsWith("\n") ? `${html}\n` : html;
  return splitLines(paintHtml);
}

/**
 * Build the visible line list from incremental extendLines state, matching
 * `lineHtmlFromEvents` (including the historical phantom trailing newline
 * when `code` is empty or ends in `\n`).
 *
 * @param {string[]} completedLines
 * @param {string[]} previewLines unsealed + pending preview from resume
 * @param {string} code
 * @returns {string[]}
 */
export function linesFromStreamState(completedLines, previewLines, code) {
  /** @type {string[]} */
  const lines = completedLines.concat(previewLines);
  // Historical paint does `html + "\n"` before splitLines when the source ends
  // on a line boundary, which yields one extra empty caret line beyond the
  // stream-style completed+pending list.
  if (code === "" || code.endsWith("\n")) {
    lines.push("");
  }
  return lines;
}

/**
 * @typedef {import("./engine.d.ts").ScopeEvent} ScopeEvent
 * @typedef {import("./incremental-tokenize.js").EventReuse} EventReuse
 */

/**
 * Number of "\n" in `code` within `[from, end)`.
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
 * Where `patchLineHtml`'s walk to the first changed line ended: the state
 * after the first `index` events of `events`. Valid for a later call whose
 * `prevEvents` is `events`, while `index` stays inside the unchanged prefix.
 * @typedef {{
 *   events: ScopeEvent[] | undefined,
 *   index: number,
 *   stack: string[],
 *   offset: number,
 *   newlines: number,
 * }} PatchMemo
 */

/** @returns {PatchMemo} */
export function createPatchMemo() {
  return { events: undefined, index: 0, stack: [], offset: 0, newlines: 0 };
}

/**
 * Same result as `lineHtmlFromEvents(events, code)`, given `prevLines` =
 * `lineHtmlFromEvents(prevEvents, prevCode)`, but only re-renders the lines
 * whose events changed and reuses `prevLines`' strings for the rest.
 *
 * `reparseIncremental` keeps the unchanged head and converged tail of the
 * event stream as the same event objects, so the changed region is found
 * by identity: a common prefix and suffix of `===` events. Events are
 * immutable, and a line's HTML depends only on its own events plus the
 * scopes open at its start, so:
 * - every line that ends before the first changed event is unchanged;
 * - every line after the first "\n" in the common suffix is unchanged too,
 *   if the same scopes are open at that "\n" on both sides (checked).
 * Only the lines between are rendered, via `extendLines` from the scopes
 * open at the first changed line's start. Mid-document typing then costs
 * pointer compares and a stack walk over the document instead of
 * `renderHtml` + `splitLines` over it: see dom-paint.bench.ts's
 * mid-document group.
 *
 * Pass the same `memo` across consecutive calls to resume that walk from
 * where the last call's ended, so repeated edits near one spot don't
 * re-walk the document before it.
 *
 * Pass `reparseIncremental`'s `reuse` (when its `from` is `prevEvents`) to
 * take the common prefix and suffix from it instead of comparing the two
 * event arrays, which is O(document) per call.
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
  let prefix = 0;
  let suffix = 0;
  if (reuse !== undefined && reuse.from === prevEvents) {
    prefix = reuse.head;
    suffix = reuse.tail;
  } else {
    const shared = Math.min(prevCount, count);
    while (prefix < shared && prevEvents[prefix] === events[prefix]) prefix++;
    if (prefix === prevCount && prefix === count) return prevLines;
    while (
      suffix < shared - prefix &&
      prevEvents[prevCount - 1 - suffix] === events[count - 1 - suffix]
    ) {
      suffix++;
    }
  }

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

  // Scopes open at that line's start, and its offset into `code`, walked
  // from the memo when it still lies in the unchanged prefix.
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
  return linesFromStreamState(
    prevLines.slice(0, firstLine).concat(rendered.completedLines),
    [rendered.pendingHtml],
    code,
  );
}

/**
 * Stateful line-HTML painter: the first paint (and any paint after a
 * language change) renders the whole document via `lineHtmlFromEvents`;
 * every later one patches the previous lines via `patchLineHtml`.
 *
 * Appends used to go through a separate stream session instead, which
 * tokenized the document a second time at mount and again after every
 * switch from mid-document editing back to appending. With
 * `reparseIncremental`'s `reuse`, the patch path no longer compares the
 * event arrays, so it costs about the same for appends and needs no
 * second tokenizer: see dom-paint.bench.ts.
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
     * @param {EventReuse} [reuse] `reparseIncremental`'s result `reuse`
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
