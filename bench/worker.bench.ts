/** WorkerSession round trips over a MessageChannel: events() ships every event, snapshot() only state. */
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
