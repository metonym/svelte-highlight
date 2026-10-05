/**
 * stream-final-highlight.js: HighlightStream's `done` pass, re-run the way
 * MarkdownStream re-runs it. Every new chunk re-renders the keyed
 * `{#each segments}` block, which hands each fence's HighlightStream its
 * `language` object again; Svelte's legacy-mode equality treats any object
 * as changed, so every already-closed fence re-runs its done pass on every
 * chunk, not just once when it closes.
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

// Closed fences: each fully fed to its own session, as HighlightStream's
// session is by the time its fence closes.
const fences = Array.from({ length: FENCE_COUNT }, (_, i) => {
  const code = sizedSlice(corpus.javascript.slice(i * FENCE_SIZE), FENCE_SIZE);
  const session = registry.createSession(LANGUAGE);
  session.append(code);
  return { code, session };
});

/** One MarkdownStream lifetime past the last fence: a fresh highlighter per
 * fence (one per HighlightStream instance), then one done-pass re-run per
 * fence per streamed chunk. */
function rerunDonePasses() {
  const instances = fences.map((fence) => ({
    ...fence,
    highlighter: createFinalHighlighter(),
  }));
  let html = "";
  for (let chunk = 0; chunk < CHUNK_COUNT; chunk++) {
    for (const { code, session, highlighter } of instances) {
      html = highlighter.highlight(session, code, LANGUAGE);
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
