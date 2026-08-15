/**
 * stream-sealed-chunks.js: the two pieces HighlightStream's sealChunk()
 * runs once per SEAL_CHUNK_LINES completed lines - buildSealedChunkHtml
 * (line-span templating) and pushSealedChunk (O(1) amortized array growth,
 * already guarded against an O(c^2) regression by
 * tests/perf-regression-guards.test.ts; this establishes the actual
 * baseline number on realistic line content instead of just a ratio).
 */
import { bench, do_not_optimize, group, run, summary } from "mitata";
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
  summary(() => {
    bench(`${chunkLines.length} highlighted lines, startLine=0`, () => {
      do_not_optimize(buildSealedChunkHtml(chunkLines, 0));
    });
    bench(
      `${chunkLines.length} highlighted lines, startLine=256 (mid-stream)`,
      () => {
        do_not_optimize(buildSealedChunkHtml(chunkLines, SEAL_CHUNK_LINES));
      },
    );
  });
});

group("pushSealedChunk(): sealing a growing stream", () => {
  summary(() => {
    for (const chunkCount of [1_000, 8_000]) {
      const chunk = buildSealedChunkHtml(chunkLines, 0);
      bench(`${chunkCount.toLocaleString()} chunks sealed`, () => {
        let chunks: string[] = [];
        for (let i = 0; i < chunkCount; i++) {
          chunks = pushSealedChunk(chunks, chunk);
        }
        do_not_optimize(chunks);
      });
    }
  });
});

// Run this suite alone with `bun bench/stream-sealed-chunks.bench.ts` for a
// fast feedback loop; bench/index.ts imports every suite for a full-baseline
// run.
if (import.meta.main) await run();
