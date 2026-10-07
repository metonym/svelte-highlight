/** Fence splitter append() per chunk vs set() on the accumulated text. */
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
