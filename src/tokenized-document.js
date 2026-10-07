/**
 * Output matches the streaming (non-canonicalized) parse: multi-line
 * lookahead past a window's edge may differ from `registry.highlight()`.
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
 * Last checkpoint whose `line` is `<= target`.
 * @param {Checkpoint[]} checkpoints
 * @param {number} target
 * @returns {Checkpoint}
 */
function findCheckpoint(checkpoints, target) {
  let lo = 0;
  let hi = checkpoints.length - 1;
  let result = /** @type {Checkpoint} */ (checkpoints[0]);
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
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
  /** @type {number[]} */
  let lineStartOffsets = [0];

  /** @type {StreamSession} */
  let session;
  let fedOffset = 0;
  let fedLineCount = 0;

  // extendLines state, advanced lazily only as far as lineRange() has needed.
  let committedLineCount = 0;
  /** @type {string[]} */
  let openScopesStack = [];
  let pendingHtmlStr = "";

  /** @type {Checkpoint[]} */
  let checkpoints = [];

  /** @type {{ checkpoint: Checkpoint, combined: string[], throughLine: number } | null} */
  let cache = null;

  /** @param {number} scanFrom */
  function extendLineOffsets(scanFrom) {
    for (
      let i = code.indexOf("\n", scanFrom);
      i !== -1;
      i = code.indexOf("\n", i + 1)
    ) {
      lineStartOffsets.push(i + 1);
    }
  }

  /**
   * `i` may be one past the last line, which resolves to `code.length`.
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
   * Feeds `checkpointInterval`-line batches until `targetLine` lines are
   * committed or the document is fed. A checkpoint after every batch stays
   * valid mid-construct: its `pendingHtml`/`openScopes` carry the
   * in-progress line forward.
   * @param {number} targetLine
   */
  function ensureTokenizedThrough(targetLine) {
    const total = lineStartOffsets.length;
    const clampedTarget = Math.min(targetLine, total);
    while (committedLineCount < clampedTarget && fedLineCount < total) {
      const batchEndLine = Math.min(fedLineCount + checkpointInterval, total);
      const batchEndOffset = lineStartOffset(batchEndLine);
      // feed() a prefix of `code`: append()-ing batches re-flattens the
      // grown text each time (~4x slower on huge files).
      if (batchEndOffset > fedOffset) {
        session.feed(code.slice(0, batchEndOffset));
      }
      fedOffset = batchEndOffset;
      fedLineCount = batchEndLine;

      // takeEvents() keeps the session from retaining every event (~140 MB
      // per 100k lines); windows re-derive events from checkpoints.
      const newEvents = session.takeEvents();
      if (newEvents.length > 0) {
        const result = extendLines(newEvents, openScopesStack, pendingHtmlStr, {
          classPrefix,
        });
        committedLineCount += result.completedLines.length;
        openScopesStack = result.openScopes;
        pendingHtmlStr = result.pendingHtml;
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

      // Bounded by `throughLine`, not `combined.length`: the last entry was
      // force-closed at that call's `end` and isn't a real line's content.
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

    /**
     * @param {number} start
     * @param {number} end
     * @returns {string[]}
     */
    textRange(start, end) {
      const total = lineStartOffsets.length;
      const s = Math.max(0, Math.min(start, total));
      const e = Math.max(s, Math.min(end, total));
      /** @type {string[]} */
      const lines = [];
      for (let i = s; i < e; i++) {
        // Exclude the "\n"; the last line runs to the end of `code`.
        const lineEnd =
          i + 1 < total ? lineStartOffset(i + 1) - 1 : code.length;
        lines.push(code.slice(lineStartOffset(i), lineEnd));
      }
      return lines;
    },

    tokenizedThrough() {
      return committedLineCount;
    },

    /**
     * @param {number} line
     * @returns {boolean}
     */
    tokenizeThrough(line) {
      ensureTokenizedThrough(line);
      return fedLineCount >= lineStartOffsets.length;
    },

    checkpointCount() {
      return checkpoints.length;
    },
  };
}
