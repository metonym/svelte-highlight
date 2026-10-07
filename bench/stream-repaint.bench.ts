/** HighlightStream's non-virtualized repaint loop (mirrors repaint()) and regenerate(). */
import { group, task } from "ostia";
import { extendLines } from "../src/engine.js";
import { createCompletedHtmlBuffer } from "../src/stream-highlighted.js";
import { computeStagedTailPreview } from "../src/stream-preview.js";
import { regenerate } from "../src/stream-regenerate.js";
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
    const next = code.slice(0, end);
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

// Tail rewrites; each task alternates two endings on one long-lived stream.
const corpusLines = sizedSlice(corpus.javascript, 400_000)
  .split("\n")
  .map((line) => `${line}\n`);

function createRegenerateStream(fedCode: string) {
  const session = registry.createSession(LANGUAGE);
  session.append(fedCode);
  const result = extendLines(session.events(), [], "");
  const completedHtml = createCompletedHtmlBuffer();
  completedHtml.appendLines(result.completedLines);
  let sealedChunks: string[] = [];
  let unsealedLines = result.completedLines;
  let sealedLineCount = 0;
  while (unsealedLines.length >= SEAL_CHUNK_LINES) {
    sealedChunks = pushSealedChunk(
      sealedChunks,
      buildSealedChunkHtml(
        unsealedLines.slice(0, SEAL_CHUNK_LINES),
        sealedLineCount,
      ),
    );
    sealedLineCount += SEAL_CHUNK_LINES;
    unsealedLines = unsealedLines.slice(SEAL_CHUNK_LINES);
  }
  return { session, fedCode, sealedChunks, completedHtml };
}

function regenerateTask(lineCount: number, tailLines: number) {
  const headLines = corpusLines.slice(0, lineCount - tailLines);
  const endings = [
    [...headLines, ...corpusLines.slice(lineCount - tailLines, lineCount)],
    [...headLines, ...corpusLines.slice(lineCount, lineCount + tailLines)],
  ].map((lines) => lines.join(""));
  const stream = createRegenerateStream(endings[0] as string);
  let count = 0;
  return () => {
    count++;
    const next = endings[count % 2] as string;
    const result = regenerate({
      session: stream.session,
      fedCode: stream.fedCode,
      code: next,
      sealedChunks: stream.sealedChunks,
      completedHtml: stream.completedHtml,
      chunkLines: SEAL_CHUNK_LINES,
    });
    stream.fedCode = next;
    stream.sealedChunks = result.sealedChunks;
    return { ...result, completed: stream.completedHtml.toString() };
  };
}

group(`HighlightStream regenerate: ${LANGUAGE}`, () => {
  task("2,000 lines, last 10% rewritten", regenerateTask(2_000, 200));
  task("8,000 lines, last 200 lines rewritten", regenerateTask(8_000, 200));
});
