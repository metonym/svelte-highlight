/**
 * HighlightStream's regenerate path: the stream's code changed in a way
 * that isn't a pure append (an LLM "regenerate the last paragraph", say).
 * Patches the session in place, then re-renders only from the sealed chunk
 * the change lands in.
 *
 * A line's HTML depends only on its events and the scopes open at its
 * start. So a sealed chunk that ends before the change, and whose events
 * the patched parse left alone, stays as it is. Only the lines from the
 * chunk the change lands in get rendered again; the lines before it are
 * just walked to compare events and track scopes. Before, every line and
 * every chunk was rebuilt - bench/stream-repaint.bench.ts.
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
 * Where `extendLinesAfterPatch` can start its walk after a `replace()`
 * that kept the first `keptEvents` events (see `StreamSession#replace`):
 * the last checkpoint before the break of the last line start that
 * certainly survives. Those events match the previous ones by identity,
 * so the walk from the top would only have confirmed them. Undefined when
 * no line start is that early.
 *
 * Before, every regenerate walked every event before the change, about a
 * fifth of a regenerate at 8,000 lines (bench/stream-repaint.bench.ts).
 * A session's first `replace()` re-parses and keeps no events, so the
 * first regenerate still walks from the top.
 * @param {StreamSession} session
 * @param {number} keptEvents
 * @param {number[]} lineStarts Ascending.
 * @returns {Checkpoint | undefined}
 */
export function walkStart(session, keptEvents, lineStarts) {
  // The text the kept events cover ends at the last checkpoint they reach.
  const kept = session.checkpointBefore({ eventCount: keptEvents });
  if (!kept) return undefined;
  // The last line start whose break lies in that text.
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
 * Offsets of the line starts every `chunkLines` lines in `text`, at most
 * `maxChunks` of them, up to `end`.
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
 * Renders a patched session's `events` from the last of `lineStarts` (text
 * offsets of line starts, ascending) whose earlier events all match
 * `previousEvents`, the events before the patch. Lines before that point
 * render exactly as they did, so only the lines from it on are rendered.
 *
 * Checking the events, not just the text, matters: with multi-line
 * lookahead (a Ruby heredoc, say), the patched parse can tokenize an
 * unchanged line differently from the stream that first rendered it.
 *
 * Returns how many of `lineStarts` are kept (rendering resumes at
 * `lineStarts[kept - 1]`, or at the top if 0) and `extendLines`' result
 * from there.
 *
 * `from`, when given, is a point known to follow only events that match
 * `previousEvents` (see `walkStart`), so the walk starts there instead of
 * at the top, with the same result.
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
  // Where line `lineStarts[kept - 1]` starts: its line break's event, the
  // break's index in it, and the scopes open there.
  let resumeEvent = 0;
  let resumeAt = 0;
  /** @type {string[]} */
  let resumeStack = [];
  /** @type {string[]} */
  const stack = from ? [...from.scopes] : [];
  let pos = from ? from.textPos : 0;
  let recorded = false;
  // Line breaks before `from` are passed; `walkStart` picks `from` before
  // the break of the last line start kept, so the walk still records it.
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
  // Unreachable with `walkStart`'s `from`; kept so a bad one costs a full
  // walk instead of wrong output.
  if (from && kept > 0 && !recorded) {
    return extendLinesAfterPatch(events, previousEvents, lineStarts);
  }
  if (kept === 0) return { kept, result: extendLines(events, [], "") };

  // Resume from the line break, so extendLines opens the line with the
  // scopes reopened, as it does after every break. The line it completes
  // first is the end of the line before: drop it.
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
 * }} options `session` was fed exactly `fedCode`; `completedHtml` holds
 *   its completed lines, and `sealedChunks` the first of them, in chunks of
 *   `chunkLines`. `completedHtml` is updated in place; `sealedChunks` is
 *   left as is.
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

  // Keep the sealed chunks that end before the changed line, as far as
  // the patched events still match.
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
