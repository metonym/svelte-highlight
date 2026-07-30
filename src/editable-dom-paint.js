/**
 * Incremental DOM-engine paint helpers for HighlightEditable.
 *
 * Tokenization via `reparseIncremental` is already incremental, but the
 * default `"dom"` engine still ran `renderHtml` + `splitLines` over the full
 * event stream every keystroke. For pure appends (typing at the end — the
 * common path when growing a document), a dedicated stream session feeds only
 * the new suffix through `extendLines`, so HTML work is O(delta) per keystroke
 * and O(n) total to type a document of size n.
 */

import { extendLines, renderHtml } from "./engine.js";
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
   * @param {string} nextLanguage
   * @returns {StreamSession}
   */
  function resetSession(nextLanguage) {
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
    if (result.completedLines.length > 0) {
      completedLines = completedLines.concat(result.completedLines);
    }
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
        const lines = lineHtmlFromEvents(events, code);
        // Defer the O(n) stream resync until the next pure append.
        needsResync = true;
        fedCode = code;
        return lines;
      }

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
