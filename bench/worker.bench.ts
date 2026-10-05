/**
 * worker.js: WorkerSession round trips through a real `MessageChannel`, so
 * each reply pays the structured clone a `Worker` boundary would. Measured
 * after a 100 KB document has streamed into the session, where the reply
 * size matters: `events()` must ship every event so far, while
 * `snapshot()` only needs the (small) tokenizer state.
 */
import { group, task } from "ostia";
import type { PostMessageTarget } from "../src/worker.d.ts";
import { createWorkerHighlighter, serveHighlighter } from "../src/worker.js";
import { buildRegistry, getCorpus, sizedSlice } from "./_shared.ts";

const registry = await buildRegistry();
const corpus = await getCorpus();
const code = sizedSlice(corpus.javascript, 100_000);

const { port1, port2 } = new MessageChannel();
serveHighlighter(port1 as unknown as PostMessageTarget, { registry });
const highlighter = createWorkerHighlighter(
  port2 as unknown as PostMessageTarget,
);
const session = highlighter.createSession("javascript");
await session.append(code);

group(
  `WorkerSession over a MessageChannel: ${(code.length / 1024).toFixed(0)} KB streamed`,
  () => {
    task("snapshot() round trip", () => session.snapshot());
    task("events() round trip", () => session.events());
  },
);

// Run this suite with `ostia bench bench/worker.bench.ts` for a fast
// feedback loop; `bun run bench` runs every *.bench.ts suite for a
// full-baseline run.
