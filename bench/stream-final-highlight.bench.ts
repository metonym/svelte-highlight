/**
 * stream-final-highlight.js: HighlightStream's `done` pass, re-run with
 * unchanged code and language. MarkdownStream used to do this on every
 * chunk: the keyed `{#each segments}` block handed each fence's
 * HighlightStream its `language` object again, and Svelte's legacy-mode
 * equality treats any object as changed. MarkdownStream no longer does
 * (bench/markdown-stream.bench.ts), but any parent that re-renders with a
 * fresh `language` object still does.
 */
import { group, task } from "ostia";
import { createFinalHighlighter } from "../src/stream-final-highlight.js";
import { buildRegistry, getCorpus, sizedSlice } from "./_shared.ts";

const registry = await buildRegistry();
const corpus = await getCorpus();
const LANGUAGE = "javascript";
const FENCE_COUNT = 10;
const FENCE_SIZE = 1_000;
const CHUNK_COUNT = 20;

// Closed fences: the code each HighlightStream holds once its fence closes.
const fences = Array.from({ length: FENCE_COUNT }, (_, i) =>
  sizedSlice(corpus.javascript.slice(i * FENCE_SIZE), FENCE_SIZE),
);

/** One MarkdownStream lifetime past the last fence: a fresh highlighter per
 * fence (one per HighlightStream instance), then one done-pass re-run per
 * fence per streamed chunk. */
function rerunDonePasses() {
  const instances = fences.map((code) => ({
    code,
    highlighter: createFinalHighlighter(),
  }));
  let html = "";
  for (let chunk = 0; chunk < CHUNK_COUNT; chunk++) {
    for (const { code, highlighter } of instances) {
      html = highlighter.highlight(registry, code, LANGUAGE);
    }
  }
  return html;
}

group(
  `done pass: ${FENCE_COUNT} closed ${FENCE_SIZE / 1000} KB fences, ${CHUNK_COUNT} chunks streamed after them`,
  () => {
    task("one done pass per fence per chunk", rerunDonePasses);
  },
);

// Run this suite with `ostia bench bench/stream-final-highlight.bench.ts`
// for a fast feedback loop; `bun run bench` runs every *.bench.ts suite for
// a full-baseline run.
