/**
 * Incremental DOM-engine paint helpers for HighlightEditable.
 *
 * Tokenization via `reparseIncremental` is already incremental, but the
 * default `"dom"` engine still ran `renderHtml` + `splitLines` over the full
 * event stream every keystroke. For pure appends (typing at the end — the
 * common path when growing a document), a dedicated stream session feeds only
 * the new suffix through `extendLines`, so HTML work is O(delta) per keystroke
 * and O(n) total to type a document of size n. Mid-document edits re-render
 * only the lines whose events changed (`patchLineHtml`).
 */

import { CLOSE, extendLines, OPEN, renderHtml, TEXT } from "./engine.js";
import { splitLines } from "./split-lines.js";

/**
 * @param {string} previousCode
 * @param {string} nextCode
 */
export function isPureAppend(previousCode, nextCode) {
  return (
    nextCode.length >= previousCode.length && nextCode.startsWith(previousCode)
  );
}

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
 * @typedef {import("./engine.d.ts").Registry} Registry
 * @typedef {import("./engine.d.ts").ScopeEvent} ScopeEvent
 * @typedef {import("./engine.d.ts").StreamSession} StreamSession
 */

/**
 * Number of "\n" in `code` before offset `end`.
 * @param {string} code
 * @param {number} end
 */
function countNewlines(code, end) {
  let count = 0;
  for (let i = code.indexOf("\n"); i !== -1 && i < end; ) {
    count++;
    i = code.indexOf("\n", i + 1);
  }
  return count;
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
 * @param {ScopeEvent[]} prevEvents
 * @param {string[]} prevLines
 * @param {ScopeEvent[]} events
 * @param {string} code
 * @returns {string[]}
 */
export function patchLineHtml(prevEvents, prevLines, events, code) {
  const prevCount = prevEvents.length;
  const count = events.length;
  const shared = Math.min(prevCount, count);
  let prefix = 0;
  while (prefix < shared && prevEvents[prefix] === events[prefix]) prefix++;
  if (prefix === prevCount && prefix === count) return prevLines;
  let suffix = 0;
  while (
    suffix < shared - prefix &&
    prevEvents[prevCount - 1 - suffix] === events[count - 1 - suffix]
  ) {
    suffix++;
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

  // Scopes open at that line's start, and its offset into `code`.
  /** @type {string[]} */
  const stack = [];
  let offset = 0;
  for (let i = 0; i < breakEvent; i++) {
    const event = /** @type {ScopeEvent} */ (events[i]);
    if (event.t === OPEN) stack.push(event.s);
    else if (event.t === CLOSE) stack.pop();
    else offset += event.v.length;
  }
  const firstLine =
    breakEvent < 0 ? 0 : countNewlines(code, offset + breakAt + 1);

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
      else prevLineCount += countNewlines(prev.v, prev.v.length);
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
 * Stateful incremental painter driven by pure-append stream sessions.
 *
 * @param {{
 *   registry: Registry,
 * }} options
 */
export function createDomLinePainter({ registry }) {
  /** @type {StreamSession | undefined} */
  let session;
  let sessionLanguage = "";
  let fedCode = "";
  let renderedEventCount = 0;
  /** @type {string[]} */
  let openScopes = [];
  let pendingHtml = "";
  /** @type {string[]} */
  let completedLines = [];
  let lastUsedIncremental = false;
  /** Whether the current session has already accepted at least one append. */
  let hasAppended = false;
  /**
   * Mid-document edits mark the stream session dirty instead of eagerly
   * re-tokenizing. The next pure append pays one full resync, then resumes
   * O(delta) painting.
   */
  let needsResync = false;
  /**
   * Events and `lineHtmlFromEvents`-equivalent lines of the last
   * mid-document paint, so the next one can `patchLineHtml` from them.
   * @type {ScopeEvent[] | undefined}
   */
  let editEvents;
  /** @type {string[] | undefined} */
  let editLines;

  /**
   * @param {string} nextLanguage
   * @returns {StreamSession}
   */
  function resetSession(nextLanguage) {
    editEvents = undefined;
    editLines = undefined;
    session = registry.createSession(nextLanguage);
    sessionLanguage = nextLanguage;
    fedCode = "";
    renderedEventCount = 0;
    openScopes = [];
    pendingHtml = "";
    completedLines = [];
    hasAppended = false;
    needsResync = false;
    return session;
  }

  /**
   * Rebuild the stream session from `base` so a subsequent delta append can
   * continue incrementally. Preserves `fedCode` across the reset.
   * @param {string} languageName
   * @param {string} base
   */
  function resyncSession(languageName, base) {
    session = resetSession(languageName);
    if (base.length > 0) {
      session.append(base);
      hasAppended = true;
      consumeCommitted(session.events());
    }
    fedCode = base;
  }

  /**
   * @param {ScopeEvent[]} committed
   */
  function consumeCommitted(committed) {
    if (!session || committed.length <= renderedEventCount) return;
    const result = extendLines(
      committed.slice(renderedEventCount),
      openScopes,
      pendingHtml,
    );
    // push, not concat: concat copies the whole (ever-growing) array on
    // every call, which is O(lines) per completed line - push is O(1)
    // amortized (same reasoning as HighlightStream's sealed-chunk append).
    for (const line of result.completedLines) completedLines.push(line);
    openScopes = result.openScopes;
    pendingHtml = result.pendingHtml;
    renderedEventCount = committed.length;
  }

  /**
   * @param {string} code
   * @returns {string[]}
   */
  function linesForCurrentCode(code) {
    if (!session) return linesFromStreamState([], [""], code);
    const snapshot = session.snapshot();
    /** @type {string[]} */
    let previewLines = [pendingHtml];
    if (snapshot.pos < fedCode.length) {
      const preview = registry.resume(fedCode, sessionLanguage, snapshot);
      const result = extendLines(preview.events, openScopes, pendingHtml);
      previewLines = result.completedLines.concat(result.pendingHtml);
    }
    return linesFromStreamState(completedLines, previewLines, code);
  }

  return {
    reset() {
      session = undefined;
      sessionLanguage = "";
      fedCode = "";
      renderedEventCount = 0;
      openScopes = [];
      pendingHtml = "";
      completedLines = [];
      lastUsedIncremental = false;
      hasAppended = false;
      needsResync = false;
      editEvents = undefined;
      editLines = undefined;
    },
    lastUsedIncremental() {
      return lastUsedIncremental;
    },
    /**
     * @param {ScopeEvent[]} events Full events from getEvents() — used only
     *   for the non-append fallback path (mid-document edits).
     * @param {string} code
     * @param {string} languageName
     * @returns {string[]}
     */
    paint(events, code, languageName) {
      if (session === undefined || languageName !== sessionLanguage) {
        session = resetSession(languageName);
      }

      if (!isPureAppend(fedCode, code)) {
        lastUsedIncremental = false;
        const lines =
          editEvents === undefined || editLines === undefined
            ? lineHtmlFromEvents(events, code)
            : patchLineHtml(editEvents, editLines, events, code);
        editEvents = events;
        editLines = lines;
        // Defer the O(n) stream resync until the next pure append.
        needsResync = true;
        fedCode = code;
        return lines;
      }

      // The append path's lines come from the stream session, not
      // `lineHtmlFromEvents`, so they can't seed `patchLineHtml`.
      editEvents = undefined;
      editLines = undefined;

      if (needsResync) {
        resyncSession(languageName, fedCode);
      }

      const hadContent = hasAppended;
      if (code.length > fedCode.length) {
        session.append(code.slice(fedCode.length));
        fedCode = code;
        hasAppended = true;
        consumeCommitted(session.events());
      } else if (code.length === 0 && fedCode.length === 0) {
        // Empty document paint.
      }

      lastUsedIncremental = hadContent;
      return linesForCurrentCode(code);
    },
  };
}
