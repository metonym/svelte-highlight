/**
 * fence-splitter.js: append()'s per-chunk rescan (only from the last
 * segment's start) against the naive alternative of re-running set() on the
 * whole accumulated text after every chunk - the thing append()'s O(chunk)
 * contract exists to avoid.
 */
import { group, task } from "ostia";
import { createFenceSplitter } from "../src/fence.js";
import { markdownWithFences } from "./_shared.ts";

const CHUNK_SIZE = 512;
const doc = markdownWithFences(200_000, 40);

function streamAppend() {
  const splitter = createFenceSplitter();
  for (let i = 0; i < doc.length; i += CHUNK_SIZE) {
    splitter.append(doc.slice(i, i + CHUNK_SIZE));
  }
  return splitter.segments();
}

function streamReparse() {
  const splitter = createFenceSplitter();
  let accumulated = "";
  for (let i = 0; i < doc.length; i += CHUNK_SIZE) {
    accumulated += doc.slice(i, i + CHUNK_SIZE);
    splitter.set(accumulated);
  }
  return splitter.segments();
}

group(
  `createFenceSplitter: ${(doc.length / 1024).toFixed(0)} KB doc, 40 fences, ${CHUNK_SIZE} B chunks`,
  () => {
    task("append() per chunk", streamAppend);
    task("set(accumulated) per chunk", streamReparse);
  },
);

// Run this suite with `ostia bench --isolate bench/fence-splitter.bench.ts`
// for a fast feedback loop; `bun run bench` runs every *.bench.ts suite for
// a full-baseline run.
