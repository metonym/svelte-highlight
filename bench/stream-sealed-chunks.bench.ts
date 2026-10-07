/** buildSealedChunkHtml() and pushSealedChunk() on realistic line content. */
import { group, task } from "ostia";
import { extendLines } from "../src/engine.js";
import {
  buildSealedChunkHtml,
  pushSealedChunk,
} from "../src/stream-sealed-chunks.js";
import { buildRegistry, getCorpus, sizedSlice } from "./_shared.ts";

const SEAL_CHUNK_LINES = 256;

const registry = await buildRegistry();
const corpus = await getCorpus();
const code = sizedSlice(corpus.javascript, 60_000);
const { events } = registry.tokenize(code, "javascript");
const { completedLines } = extendLines(events, [], "");
const chunkLines = completedLines.slice(0, SEAL_CHUNK_LINES);

group("buildSealedChunkHtml()", () => {
  task(`${chunkLines.length} highlighted lines, startLine=0`, () =>
    buildSealedChunkHtml(chunkLines, 0),
  );
  task(
    `${chunkLines.length} highlighted lines, startLine=256 (mid-stream)`,
    () => buildSealedChunkHtml(chunkLines, SEAL_CHUNK_LINES),
  );
});

group("pushSealedChunk(): sealing a growing stream", () => {
  for (const chunkCount of [1_000, 8_000]) {
    const chunk = buildSealedChunkHtml(chunkLines, 0);
    task(`${chunkCount.toLocaleString()} chunks sealed`, () => {
      let chunks: string[] = [];
      for (let i = 0; i < chunkCount; i++) {
        chunks = pushSealedChunk(chunks, chunk);
      }
      return chunks;
    });
  }
});
