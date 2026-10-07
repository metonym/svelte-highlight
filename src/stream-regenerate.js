/**
 * HighlightStream's non-append edit path: patches the session in place and
 * re-renders only from the sealed chunk the change lands in. A line's HTML
 * depends only on its events and the scopes open at its start, so earlier
 * chunks whose events are unchanged are kept.
 */

import { CLOSE, extendLines, OPEN, TEXT } from "./engine.js";
import {
  buildSealedChunkHtml,
  pushSealedChunk,
} from "./stream-sealed-chunks.js";
import { diffText } from "./text-diff.js";

/**
 * @typedef {import("./engine.d.ts").ScopeEvent} ScopeEvent
 * @typedef {import("./engine.d.ts").StreamSession} StreamSession
 * @typedef {ReturnType<typeof import("./stream-highlighted.js").createCompletedHtmlBuffer>} CompletedHtmlBuffer
 * @typedef {NonNullable<ReturnType<StreamSession["checkpointBefore"]>>} Checkpoint
 */

/**
 * Where `extendLinesAfterPatch` can start walking after a `replace()` that
 * kept the first `keptEvents` events: the last checkpoint before the break of
 * the last line start those events cover. Undefined if none is that early.
 * @param {StreamSession} session
 * @param {number} keptEvents
 * @param {number[]} lineStarts Ascending.
 * @returns {Checkpoint | undefined}
 */
export function walkStart(session, keptEvents, lineStarts) {
  const kept = session.checkpointBefore({ eventCount: keptEvents });
  if (!kept) return undefined;
  let last = -1;
  while (
    last + 1 < lineStarts.length &&
    /** @type {number} */ (lineStarts[last + 1]) - 1 < kept.textPos
  ) {
    last++;
  }
  if (last < 0) return undefined;
  return session.checkpointBefore({
    textPos: /** @type {number} */ (lineStarts[last]) - 1,
  });
}

/**
 * Offsets of every `chunkLines`-th line start in `text` before `end`, at most
 * `maxChunks`.
 * @param {string} text
 * @param {number} end
 * @param {number} chunkLines
 * @param {number} maxChunks
 * @returns {number[]}
 */
function chunkStarts(text, end, chunkLines, maxChunks) {
  /** @type {number[]} */
  const starts = [];
  let lines = 0;
  for (
    let i = text.indexOf("\n");
    i !== -1 && i < end && starts.length < maxChunks;
    i = text.indexOf("\n", i + 1)
  ) {
    if (++lines === chunkLines) {
      starts.push(i + 1);
      lines = 0;
    }
  }
  return starts;
}

/**
 * @param {ScopeEvent} a
 * @param {ScopeEvent | undefined} b
 */
function sameEvent(a, b) {
  if (a === b) return true;
  if (b === undefined || a.t !== b.t) return false;
  if (a.t === TEXT) return a.v === /** @type {{ v: string }} */ (b).v;
  if (a.t === OPEN) return a.s === /** @type {{ s: string }} */ (b).s;
  return true;
}

/**
 * Renders patched `events` from the last of `lineStarts` whose preceding
 * events all match `previousEvents`. Compares events, not text: multi-line
 * lookahead (Ruby heredocs) can re-tokenize an unchanged line differently.
 *
 * Returns how many `lineStarts` are kept (rendering resumes at
 * `lineStarts[kept - 1]`, or the top if 0) and `extendLines`' result.
 * `from` (see `walkStart`) skips the walk over known-matching events.
 * @param {ScopeEvent[]} events
 * @param {ScopeEvent[]} previousEvents
 * @param {number[]} lineStarts
 * @param {Checkpoint} [from]
 * @returns {{ kept: number, result: ReturnType<typeof extendLines> }}
 */
export function extendLinesAfterPatch(
  events,
  previousEvents,
  lineStarts,
  from,
) {
  let kept = 0;
  // Where `lineStarts[kept - 1]` starts: its break's event, offset, and scopes.
  let resumeEvent = 0;
  let resumeAt = 0;
  /** @type {string[]} */
  let resumeStack = [];
  /** @type {string[]} */
  const stack = from ? [...from.scopes] : [];
  let pos = from ? from.textPos : 0;
  let recorded = false;
  // Skip line breaks before `from`; `walkStart` puts `from` before the last
  // kept break, so the walk still records it.
  while (
    kept < lineStarts.length &&
    /** @type {number} */ (lineStarts[kept]) - 1 < pos
  ) {
    kept++;
  }
  for (
    let i = from ? from.eventCount : 0;
    i < events.length && kept < lineStarts.length;
    i++
  ) {
    const event = /** @type {ScopeEvent} */ (events[i]);
    if (!sameEvent(event, previousEvents[i])) break;
    if (event.t === OPEN) {
      stack.push(event.s);
    } else if (event.t === CLOSE) {
      stack.pop();
    } else {
      const end = pos + event.v.length;
      while (
        kept < lineStarts.length &&
        /** @type {number} */ (lineStarts[kept]) - 1 < end
      ) {
        resumeEvent = i;
        resumeAt = /** @type {number} */ (lineStarts[kept]) - 1 - pos;
        resumeStack = [...stack];
        kept++;
        recorded = true;
      }
      pos = end;
    }
  }
  // Defensive: a bad `from` costs a full walk instead of wrong output.
  if (from && kept > 0 && !recorded) {
    return extendLinesAfterPatch(events, previousEvents, lineStarts);
  }
  if (kept === 0) return { kept, result: extendLines(events, [], "") };

  // Resume at the line break so extendLines reopens scopes; drop the first
  // completed line (the tail of the previous line).
  const text = /** @type {{ v: string }} */ (events[resumeEvent]).v;
  /** @type {ScopeEvent[]} */
  const rest = [{ t: TEXT, v: text.slice(resumeAt) }];
  for (let j = resumeEvent + 1; j < events.length; j++) {
    rest.push(/** @type {ScopeEvent} */ (events[j]));
  }
  const result = extendLines(rest, resumeStack, "");
  result.completedLines = result.completedLines.slice(1);
  return { kept, result };
}

/**
 * @param {{
 *   session: StreamSession,
 *   fedCode: string,
 *   code: string,
 *   sealedChunks: string[],
 *   completedHtml: CompletedHtmlBuffer,
 *   chunkLines: number,
 * }} options `session` was fed exactly `fedCode`. `completedHtml` is
 *   updated in place; `sealedChunks` is not mutated.
 * @returns {{
 *   sealedChunks: string[],
 *   sealedLineCount: number,
 *   unsealedLines: string[],
 *   pendingHtml: string,
 *   openScopes: string[],
 *   committedCount: number,
 * }}
 */
export function regenerate({
  session,
  fedCode,
  code,
  sealedChunks,
  completedHtml,
  chunkLines,
}) {
  const previousEvents = session.events();
  const { start, removed, inserted } = diffText(fedCode, code);
  const keptEvents = session.replace(start, start + removed.length, inserted);
  const events = session.events();

  const lineStarts = chunkStarts(code, start, chunkLines, sealedChunks.length);
  const { kept: keptChunks, result } = extendLinesAfterPatch(
    events,
    previousEvents,
    lineStarts,
    keptEvents > 0 ? walkStart(session, keptEvents, lineStarts) : undefined,
  );

  let sealedLineCount = keptChunks * chunkLines;
  completedHtml.truncate(sealedLineCount);
  completedHtml.appendLines(result.completedLines);
  let chunks = sealedChunks.slice(0, keptChunks);
  let unsealedLines = result.completedLines;
  while (unsealedLines.length >= chunkLines) {
    chunks = pushSealedChunk(
      chunks,
      buildSealedChunkHtml(unsealedLines.slice(0, chunkLines), sealedLineCount),
    );
    sealedLineCount += chunkLines;
    unsealedLines = unsealedLines.slice(chunkLines);
  }
  return {
    sealedChunks: chunks,
    sealedLineCount,
    unsealedLines,
    pendingHtml: result.pendingHtml,
    openScopes: result.openScopes,
    committedCount: events.length,
  };
}
