/**
 * The streaming state behind HighlightStream, with no DOM or framework.
 * Feed it the growing code buffer; it returns sealed HTML chunks, the live
 * tail lines and the full highlighted HTML.
 */
import { extendLines } from "./engine.js";
import { ensureRegistered, registry } from "./registry.js";
import { createFinalHighlighter } from "./stream-final-highlight.js";
import { createCompletedHtmlBuffer } from "./stream-highlighted.js";
import { computeStagedTailPreview } from "./stream-preview.js";
import { regenerate } from "./stream-regenerate.js";
import {
  buildSealedChunkHtml,
  pushSealedChunk,
} from "./stream-sealed-chunks.js";

// Full chunks become one immutable HTML string, so a renderer only diffs
// the bounded unsealed tail.
export const SEAL_CHUNK_LINES = 256;

/**
 * @typedef {object} StreamHighlighterState
 * @property {string} highlighted Full highlighted HTML.
 * @property {string[]} sealedChunks Append-only; past entries never change.
 *   The same array is returned each time, so copy it to detect changes.
 * @property {number} sealedLineCount Lines inside `sealedChunks`.
 * @property {string[]} tailLines Unsealed completed lines plus the live
 *   preview line(s). Line `i` is document line `sealedLineCount + i`.
 */

export function createStreamHighlighter() {
  /** @type {ReturnType<typeof registry.createSession> | undefined} */
  let session;
  let sessionLanguageName = "";
  // Prefix of the code already fed to `session`.
  let fedCode = "";

  let finalizedPendingHtml = "";
  /** @type {string[]} */
  let finalizedOpenScopes = [];
  let renderedCommittedCount = 0;
  /** @type {import("./stream-preview.d.ts").PreviewCache | undefined} */
  let previewCache;

  /** @type {string[]} */
  let sealedChunks = [];
  let sealedLineCount = 0;
  // Completed lines for `highlighted`, so it isn't rebuilt per update.
  const completedHtml = createCompletedHtmlBuffer();
  const finalHighlighter = createFinalHighlighter();
  // Bounded by SEAL_CHUNK_LINES, so touching it every update stays O(1).
  /** @type {string[]} */
  let unsealedLines = [];
  /** @type {string[]} */
  let tailLines = [];
  let highlighted = "";

  /** @returns {StreamHighlighterState} */
  function state() {
    return { highlighted, sealedChunks, sealedLineCount, tailLines };
  }

  /**
   * @param {string} code
   * @param {import("./languages").LanguageType<string>} language
   */
  function ensureSession(code, language) {
    if (
      session &&
      sessionLanguageName === language.name &&
      code.startsWith(fedCode)
    ) {
      return;
    }
    ensureRegistered(language);
    if (session && sessionLanguageName === language.name) {
      // Not a pure append: patch in place rather than lose every sealed chunk.
      const next = regenerate({
        session,
        fedCode,
        code,
        sealedChunks,
        completedHtml,
        chunkLines: SEAL_CHUNK_LINES,
      });
      fedCode = code;
      previewCache = undefined;
      finalizedPendingHtml = next.pendingHtml;
      finalizedOpenScopes = next.openScopes;
      renderedCommittedCount = next.committedCount;
      sealedChunks = next.sealedChunks;
      sealedLineCount = next.sealedLineCount;
      unsealedLines = next.unsealedLines;
      tailLines = unsealedLines;
      return;
    }
    reset();
    session = registry.createSession(language.name);
    sessionLanguageName = language.name;
  }

  // Also runs after `finish`, so a closed stream keeps only its final HTML;
  // resuming re-feeds the whole buffer.
  function reset() {
    session = undefined;
    sessionLanguageName = "";
    fedCode = "";
    finalizedPendingHtml = "";
    finalizedOpenScopes = [];
    renderedCommittedCount = 0;
    previewCache = undefined;
    sealedChunks = [];
    sealedLineCount = 0;
    completedHtml.reset();
    unsealedLines = [];
    tailLines = [];
  }

  function sealChunk() {
    const chunkLines = unsealedLines.slice(0, SEAL_CHUNK_LINES);
    sealedChunks = pushSealedChunk(
      sealedChunks,
      buildSealedChunkHtml(chunkLines, sealedLineCount),
    );
    sealedLineCount += chunkLines.length;
    unsealedLines = unsealedLines.slice(SEAL_CHUNK_LINES);
  }

  return {
    /**
     * Highlights the buffer while it streams. Appends are incremental; any
     * other change patches the sealed output in place.
     * @param {string} code
     * @param {import("./languages").LanguageType<string>} language
     * @returns {StreamHighlighterState}
     */
    update(code, language) {
      ensureSession(code, language);
      const live = /** @type {NonNullable<typeof session>} */ (session);
      if (code.length > fedCode.length) {
        live.append(code.slice(fedCode.length));
        fedCode = code;
      }

      const committed = live.events();
      if (committed.length > renderedCommittedCount) {
        const result = extendLines(
          committed.slice(renderedCommittedCount),
          finalizedOpenScopes,
          finalizedPendingHtml,
        );
        if (result.completedLines.length > 0) {
          completedHtml.appendLines(result.completedLines);
          unsealedLines = unsealedLines.concat(result.completedLines);
          while (unsealedLines.length >= SEAL_CHUNK_LINES) sealChunk();
        }
        finalizedPendingHtml = result.pendingHtml;
        finalizedOpenScopes = result.openScopes;
        renderedCommittedCount = committed.length;
      }

      const { previewLines, cache } = computeStagedTailPreview({
        registry,
        language: sessionLanguageName,
        session: live,
        fedCode,
        openScopes: finalizedOpenScopes,
        pendingHtml: finalizedPendingHtml,
        cache: previewCache,
      });
      previewCache = cache;

      tailLines = [...unsealedLines, ...previewLines];

      // A trailing empty preview keeps a final `\n` when the stream ends a line.
      const completed = completedHtml.toString();
      highlighted =
        completedHtml.lineCount === 0
          ? previewLines.join("\n")
          : `${completed}\n${previewLines.join("\n")}`;
      return state();
    },

    /**
     * One full re-parse once the stream is done, for multi-line lookahead
     * (heredocs, etc.). Frees the streaming state.
     * @param {string} code
     * @param {import("./languages").LanguageType<string>} language
     * @returns {StreamHighlighterState}
     */
    finish(code, language) {
      ensureRegistered(language);
      highlighted = finalHighlighter.highlight(registry, code, language.name);
      if (session) reset();
      return state();
    },
  };
}
