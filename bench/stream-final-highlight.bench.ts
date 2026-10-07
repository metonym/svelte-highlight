/** HighlightStream's done pass re-run with unchanged code, as when a parent passes a fresh `language`. */
import { group, task } from "ostia";
import { createFinalHighlighter } from "../src/stream-final-highlight.js";
import { buildRegistry, getCorpus, sizedSlice } from "./_shared.ts";

const registry = await buildRegistry();
const corpus = await getCorpus();
const LANGUAGE = "javascript";
const FENCE_COUNT = 10;
const FENCE_SIZE = 1_000;
const CHUNK_COUNT = 20;

const fences = Array.from({ length: FENCE_COUNT }, (_, i) =>
  sizedSlice(corpus.javascript.slice(i * FENCE_SIZE), FENCE_SIZE),
);

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
