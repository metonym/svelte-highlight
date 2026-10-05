/**
 * HighlightStream's default (non-virtualized) repaint loop, end to end, on
 * a multi-line document streamed in small LLM-token-sized chunks: one
 * repaint per chunk - append to the session, render newly completed lines
 * with extendLines, seal full chunks, compute the staged-tail preview, and
 * assemble the `highlight` event payload. Mirrors repaint() in
 * src/HighlightStream.svelte step for step, so per-frame work that grows
 * with the whole stream (instead of the chunk) shows up here.
 */
import { group, task } from "ostia";
import { extendLines } from "../src/engine.js";
import { createCompletedHtmlBuffer } from "../src/stream-highlighted.js";
import { computeStagedTailPreview } from "../src/stream-preview.js";
import {
  buildSealedChunkHtml,
  pushSealedChunk,
} from "../src/stream-sealed-chunks.js";
import { buildRegistry, getCorpus, sizedSlice } from "./_shared.ts";

const registry = await buildRegistry();
const corpus = await getCorpus();
const LANGUAGE = "javascript";
const SEAL_CHUNK_LINES = 256;
const CHUNK_SIZE = 24;
const code = sizedSlice(corpus.javascript, 100_000);

function streamRepaint() {
  const session = registry.createSession(LANGUAGE);
  let fedCode = "";
  let finalizedPendingHtml = "";
  let finalizedOpenScopes: string[] = [];
  let renderedCommittedCount = 0;
  let previewCache: Parameters<typeof computeStagedTailPreview>[0]["cache"];
  let sealedChunks: string[] = [];
  let sealedLineCount = 0;
  const completedHtml = createCompletedHtmlBuffer();
  let unsealedLines: string[] = [];
  let tailLines: string[] = [];
  let highlighted = "";

  for (
    let end = CHUNK_SIZE;
    end < code.length + CHUNK_SIZE;
    end += CHUNK_SIZE
  ) {
    // The `code` prop as the parent would pass it after each chunk.
    const next = code.slice(0, end);
    // ensureSession(): a pure append keeps the session.
    if (!next.startsWith(fedCode)) throw new Error("not an append");
    if (next.length > fedCode.length) {
      session.append(next.slice(fedCode.length));
      fedCode = next;
    }

    const committed = session.events();
    if (committed.length > renderedCommittedCount) {
      const result = extendLines(
        committed.slice(renderedCommittedCount),
        finalizedOpenScopes,
        finalizedPendingHtml,
      );
      if (result.completedLines.length > 0) {
        completedHtml.appendLines(result.completedLines);
        unsealedLines = unsealedLines.concat(result.completedLines);
        while (unsealedLines.length >= SEAL_CHUNK_LINES) {
          const chunkLines = unsealedLines.slice(0, SEAL_CHUNK_LINES);
          sealedChunks = pushSealedChunk(
            sealedChunks,
            buildSealedChunkHtml(chunkLines, sealedLineCount),
          );
          sealedLineCount += chunkLines.length;
          unsealedLines = unsealedLines.slice(SEAL_CHUNK_LINES);
        }
      }
      finalizedPendingHtml = result.pendingHtml;
      finalizedOpenScopes = result.openScopes;
      renderedCommittedCount = committed.length;
    }

    const { previewLines, cache } = computeStagedTailPreview({
      registry,
      language: LANGUAGE,
      session,
      fedCode,
      openScopes: finalizedOpenScopes,
      pendingHtml: finalizedPendingHtml,
      cache: previewCache,
    });
    previewCache = cache;

    tailLines = [...unsealedLines, ...previewLines];
    highlighted =
      completedHtml.lineCount === 0
        ? previewLines.join("\n")
        : `${completedHtml.toString()}\n${previewLines.join("\n")}`;
  }

  return { sealedChunks, tailLines, highlighted };
}

group(
  `HighlightStream repaint loop: ${(code.length / 1024).toFixed(0)} KB ${LANGUAGE}, ${CHUNK_SIZE} B chunks`,
  () => {
    task("one repaint per chunk", streamRepaint);
  },
);

// Run this suite with `ostia bench bench/stream-repaint.bench.ts` for a fast
// feedback loop; `bun run bench` runs every *.bench.ts suite for a
// full-baseline run.
