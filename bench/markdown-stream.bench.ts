/**
 * MarkdownStream end to end: a 50 KB, 10-fence reply streamed in 88 chunks
 * through the real components, mounted on tests/svelte-dom.ts's minimal DOM.
 * Covers the per-chunk work every fence's HighlightStream does (or skips)
 * and what closed fences keep alive. Run with `--alloc` for the retained
 * heap of a finished stream.
 */
import path from "node:path";
import { group, task } from "ostia";
import javascript from "../src/languages/javascript.js";
import {
  flush,
  loadComponents,
  type Mounted,
  mountComponent,
} from "../tests/svelte-dom.ts";
import { getCorpus, sizedSlice } from "./_shared.ts";

const { MarkdownStream } = await loadComponents(
  path.join(import.meta.dir, "../src"),
  ["HighlightStream", "MarkdownStream"],
);

const corpus = await getCorpus();
const FENCE_COUNT = 10;
const FENCE_SIZE = 5_000;
const CHUNK_COUNT = 88;

const prose =
  "Here is the next step. It builds on the previous block and changes how the state is passed around.\n\n";
const markdown = Array.from({ length: FENCE_COUNT }, (_, i) => {
  // A "```" line in the corpus would close the fence early.
  const code = sizedSlice(
    corpus.javascript.slice(i * FENCE_SIZE),
    FENCE_SIZE,
  ).replaceAll("```", "'''");
  return `${prose}\`\`\`js\n${code}${code.endsWith("\n") ? "" : "\n"}\`\`\`\n\n`;
}).join("");
const chunkSize = Math.ceil(markdown.length / CHUNK_COUNT);
const kept: Mounted[] = [];

/** Streams the whole reply, then `done`, with an event-loop turn per chunk
 * (where `resolveLanguage`'s promise lands). */
async function streamReply(): Promise<Mounted> {
  const stream = mountComponent(MarkdownStream, {
    resolveLanguage: () => javascript,
  });
  for (
    let end = chunkSize;
    end < markdown.length + chunkSize;
    end += chunkSize
  ) {
    stream.set({ text: markdown.slice(0, end) });
    // biome-ignore lint/performance/noAwaitInLoops: one event-loop turn per chunk, as a real stream gets
    await Promise.resolve();
    flush();
  }
  stream.set({ done: true });
  return stream;
}

group(
  `MarkdownStream: ${Math.round(markdown.length / 1000)} KB, ${FENCE_COUNT} fences, ${CHUNK_COUNT} chunks`,
  () => {
    // Both return the final HTML, so `bench:ab` checks it's unchanged.
    task("stream to done", async () => {
      const stream = await streamReply();
      const html = stream.target.innerHTML;
      stream.destroy();
      return html;
    });
    // Keeps every finished stream mounted, so `--alloc` reports what one
    // keeps alive.
    task("stream to done, keep mounted", async () => {
      const stream = await streamReply();
      kept.push(stream);
      return stream.target.innerHTML;
    });
  },
);
