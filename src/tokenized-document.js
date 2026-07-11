/**
 * A shared substrate for windowed rendering: text plus an engine checkpoint
 * every `checkpointInterval` lines, so highlighted HTML for any line range
 * costs O(range + interval) instead of O(document). Built on the same
 * `StreamSession` / `Registry#resume` / `extendLines` primitives
 * `HighlightStream` uses for incremental streaming - this module applies
 * the same checkpoint/resume trick to random-access windows instead of a
 * growing tail.
 *
 * Fidelity caveat: window output matches the *streaming* (non-canonicalized)
 * parse. Constructs needing multi-line lookahead beyond a window's edge may
 * differ from `registry.highlight()`'s canonical output - the same tradeoff
 * `HighlightStream`'s live view already makes.
 *
 * No mid-document edit support: `append` and full `setCode` resets only. A
 * patch/invalidation API for editable large documents is out of scope here.
 */

/**
 * @typedef {import("./engine.d.ts").Snapshot} Snapshot
 * @typedef {import("./engine.d.ts").StreamSession} StreamSession
 */

/**
 * @typedef {{
 *   line: number,
 *   snapshot: Snapshot,
 *   openScopes: string[],
 *   pendingHtml: string,
 * }} Checkpoint
 */

import { extendLines } from "./engine.js";
import { ensureRegistered, registry } from "./registry.js";

/**
 * Finds the last checkpoint whose `line` is `<= target`. `checkpoints` is
 * non-empty (index 0 always covers line 0) and sorted ascending by `line`.
 * @param {Checkpoint[]} checkpoints
 * @param {number} target
 * @returns {Checkpoint}
 */
function findCheckpoint(checkpoints, target) {
  let lo = 0;
  let hi = checkpoints.length - 1;
  // checkpoints[0] is always present (index 0 covers line 0).
  let result = /** @type {Checkpoint} */ (checkpoints[0]);
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    // mid is in [lo, hi], always a valid checkpoints index.
    const candidate = /** @type {Checkpoint} */ (checkpoints[mid]);
    if (candidate.line <= target) {
      result = candidate;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}

/**
 * @param {{
 *   language: import("./languages").LanguageType<string>,
 *   checkpointInterval?: number,
 *   classPrefix?: string,
 * }} options
 */
export function createTokenizedDocument({
  language,
  checkpointInterval = 100,
  classPrefix = "hljs-",
}) {
  ensureRegistered(language);

  /** @type {string} */
  let code = "";
  /** Character offset each line starts at; one entry per line (line 0 is always 0). */
  /** @type {number[]} */
  let lineStartOffsets = [0];

  /** @type {StreamSession} */
  let session;
  /** Character offset of `code` already fed to `session`. */
  let fedOffset = 0;
  /** Line count already fed to `session` (index into `lineStartOffsets`). */
  let fedLineCount = 0;

  // Incremental extendLines state, advanced lazily as far as any lineRange()
  // call has required (never further) - the same bookkeeping HighlightStream
  // uses, except only checkpoints are retained, not the full line history.
  let committedLineCount = 0;
  /** @type {string[]} */
  let openScopesStack = [];
  let pendingHtmlStr = "";
  let renderedEventCount = 0;

  /** @type {Checkpoint[]} */
  let checkpoints = [];

  /** @type {{ checkpoint: Checkpoint, combined: string[], throughLine: number } | null} */
  let cache = null;

  /** @param {number} scanFrom Character offset to resume scanning from. */
  function extendLineOffsets(scanFrom) {
    for (let i = scanFrom; i < code.length; i++) {
      if (code.charCodeAt(i) === 10) lineStartOffsets.push(i + 1);
    }
  }

  /**
   * The character offset line `i` starts at. `i` may equal `lineCount()`
   * (one past the last line), which resolves to `code.length`.
   * @param {number} i
   */
  function lineStartOffset(i) {
    return i < lineStartOffsets.length
      ? /** @type {number} */ (lineStartOffsets[i])
      : code.length;
  }

  /** @param {string} newCode */
  function reset(newCode) {
    code = newCode;
    lineStartOffsets = [0];
    extendLineOffsets(0);
    session = registry.createSession(language.name);
    fedOffset = 0;
    fedLineCount = 0;
    committedLineCount = 0;
    openScopesStack = [];
    pendingHtmlStr = "";
    renderedEventCount = 0;
    checkpoints = [
      {
        line: 0,
        snapshot: session.snapshot(),
        openScopes: [],
        pendingHtml: "",
      },
    ];
    cache = null;
  }

  reset("");

  /**
   * Feeds the session in `checkpointInterval`-line batches until either
   * `targetLine` lines are committed or the whole document has been fed.
   * Recording a checkpoint after every batch, regardless of how many lines
   * it actually completed, keeps checkpoints valid even when a batch lands
   * mid-construct (an unresolved multi-line lookahead): the checkpoint's
   * `pendingHtml`/`openScopes` simply carry the in-progress line forward,
   * mirroring HighlightStream's own finalizedPendingHtml/openScopes.
   * @param {number} targetLine
   */
  function ensureTokenizedThrough(targetLine) {
    const total = lineStartOffsets.length;
    const clampedTarget = Math.min(targetLine, total);
    while (committedLineCount < clampedTarget && fedLineCount < total) {
      const batchEndLine = Math.min(fedLineCount + checkpointInterval, total);
      const batchEndOffset = lineStartOffset(batchEndLine);
      const chunk = code.slice(fedOffset, batchEndOffset);
      if (chunk.length > 0) session.append(chunk);
      fedOffset = batchEndOffset;
      fedLineCount = batchEndLine;

      const committedEvents = session.events();
      if (committedEvents.length > renderedEventCount) {
        const result = extendLines(
          committedEvents.slice(renderedEventCount),
          openScopesStack,
          pendingHtmlStr,
          { classPrefix },
        );
        committedLineCount += result.completedLines.length;
        openScopesStack = result.openScopes;
        pendingHtmlStr = result.pendingHtml;
        renderedEventCount = committedEvents.length;
      }

      checkpoints.push({
        line: committedLineCount,
        snapshot: session.snapshot(),
        openScopes: openScopesStack.slice(),
        pendingHtml: pendingHtmlStr,
      });
    }
  }

  return {
    /** @param {string} newCode */
    setCode(newCode) {
      if (newCode.startsWith(code)) {
        this.append(newCode.slice(code.length));
      } else {
        reset(newCode);
      }
    },

    /** @param {string} chunk */
    append(chunk) {
      if (chunk === "") return;
      const scanFrom = code.length;
      code += chunk;
      extendLineOffsets(scanFrom);
    },

    lineCount() {
      return lineStartOffsets.length;
    },

    /**
     * @param {number} start
     * @param {number} end
     * @returns {string[]}
     */
    lineRange(start, end) {
      const total = lineStartOffsets.length;
      const s = Math.max(0, Math.min(start, total));
      const e = Math.max(s, Math.min(end, total));
      if (s === e) return [];

      ensureTokenizedThrough(e);

      const checkpoint = findCheckpoint(checkpoints, s);

      // `combined`'s last entry (pendingHtml) is only valid as the answer for
      // the exact `end` it was computed against: resume()'s finish() force-
      // closes whatever is still open at that cut point, which is correct
      // for *that* boundary but not a real line's content otherwise. Cache
      // coverage is therefore bounded by `throughLine` - the count of
      // genuinely-completed lines - never by `combined.length`, so a later,
      // larger `end` can't accidentally reuse that force-closed entry as if
      // it were real, already-tokenized content.
      if (cache && cache.checkpoint === checkpoint && e <= cache.throughLine) {
        return cache.combined.slice(s - checkpoint.line, e - checkpoint.line);
      }

      const prefix = code.slice(0, lineStartOffset(e));
      const resumed = registry.resume(
        prefix,
        language.name,
        checkpoint.snapshot,
      );
      const result = extendLines(
        resumed.events,
        checkpoint.openScopes,
        checkpoint.pendingHtml,
        { classPrefix },
      );
      const combined = [...result.completedLines, result.pendingHtml];
      const throughLine = checkpoint.line + result.completedLines.length;
      cache = { checkpoint, combined, throughLine };

      return combined.slice(s - checkpoint.line, e - checkpoint.line);
    },

    tokenizedThrough() {
      return committedLineCount;
    },
  };
}
