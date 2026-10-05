import path from "node:path";
import javascript from "../src/languages/javascript.js";
import {
  flush,
  loadComponents,
  type Mounted,
  mountComponent,
  nextInstanceId,
  onDispatch,
} from "./svelte-dom.ts";

const { HighlightStream, MarkdownStream } = await loadComponents(
  path.join(import.meta.dir, "../src"),
  ["HighlightStream", "MarkdownStream"],
);

const FENCE_COUNT = 4;
const CHUNK = 9;

function fenceCode(i: number) {
  return `const a${i} = ${i};\n/* note\n   ${i} */\nfunction f${i}() {\n  return \`t\${a${i}}\`;\n}\n`;
}

const markdown = Array.from(
  { length: FENCE_COUNT },
  (_, i) => `Step ${i}:\n\n\`\`\`js\n${fenceCode(i)}\`\`\`\n\n`,
).join("");

// Lets `resolveLanguage`'s promise land, then flushes what it scheduled.
async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  flush();
}

function mountMarkdown(props: Record<string, unknown> = {}) {
  return mountComponent(MarkdownStream, {
    resolveLanguage: () => javascript,
    ...props,
  });
}

// Fence `i`'s closing line ends at this offset in `markdown`.
function closeOffset(i: number) {
  let offset = 0;
  for (let k = 0; k <= i; k++) {
    offset = markdown.indexOf("```\n\n", markdown.indexOf("```js", offset) + 5);
  }
  return offset + 4;
}

async function streamMarkdown(
  stream: Mounted,
  onChunk: (end: number) => void = () => {},
) {
  for (let end = CHUNK; end < markdown.length + CHUNK; end += CHUNK) {
    stream.set({ text: markdown.slice(0, end) });
    // biome-ignore lint/performance/noAwaitInLoops: each chunk must settle before the next is sent
    await settle();
    onChunk(Math.min(end, markdown.length));
  }
}

afterEach(() => onDispatch(undefined));

describe("MarkdownStream fence updates", () => {
  it("updates only the open fence's HighlightStream per chunk", async () => {
    // MarkdownStream creates its dispatcher first, then one HighlightStream
    // per fence, in order.
    const first = nextInstanceId() + 1;
    /** Fence index -> `highlight` count during the current chunk. */
    let highlights = new Map<number, number>();
    onDispatch((instance, type) => {
      if (type !== "highlight") return;
      const fence = instance - first;
      highlights.set(fence, (highlights.get(fence) ?? 0) + 1);
    });

    const stream = mountMarkdown();
    const afterClose = new Array<number>(FENCE_COUNT).fill(0);
    let previousEnd = 0;
    await streamMarkdown(stream, (end) => {
      for (const [fence, count] of highlights) {
        const close = closeOffset(fence);
        // A fence that closed before this chunk never updates again.
        expect({ fence, closedBefore: close <= previousEnd }).toEqual({
          fence,
          closedBefore: false,
        });
        if (close <= end) afterClose[fence] = (afterClose[fence] ?? 0) + count;
      }
      highlights = new Map();
      previousEnd = end;
    });

    // The done pass: `highlight` once per fence, as it closes.
    expect(afterClose).toEqual(new Array(FENCE_COUNT).fill(1));
    stream.destroy();
  });

  it("renders the same HTML streamed as in one shot", async () => {
    const streamed = mountMarkdown();
    await streamMarkdown(streamed);
    streamed.set({ done: true });

    const oneShot = mountMarkdown({ text: markdown, done: true });
    await settle();

    expect(streamed.target.innerHTML).toContain('class="hljs-keyword"');
    expect(streamed.target.innerHTML).toBe(oneShot.target.innerHTML);
    streamed.destroy();
    oneShot.destroy();
  });

  it("re-highlights a closed fence when a regenerate rewrites it", async () => {
    const regenerated = markdown.replace("const a0 = 0;", "let a0 = 0;");
    const stream = mountMarkdown();
    await streamMarkdown(stream);
    stream.set({ text: regenerated });
    await settle();
    stream.set({ done: true });

    const oneShot = mountMarkdown({ text: regenerated, done: true });
    await settle();

    expect(stream.target.innerHTML).toContain("let</span> a0");
    expect(stream.target.innerHTML).toBe(oneShot.target.innerHTML);
    stream.destroy();
    oneShot.destroy();
  });
});

describe("HighlightStream after done", () => {
  const code = fenceCode(1) + fenceCode(2);

  function streamCode(stream: Mounted, text: string, from = 0) {
    for (let end = from + CHUNK; end < text.length + CHUNK; end += CHUNK) {
      stream.set({ code: text.slice(0, end) });
    }
  }

  it("resumes streaming with the same output as an unbroken stream", async () => {
    const resumed = mountComponent(HighlightStream, { language: javascript });
    const split = code.indexOf("function f2");
    streamCode(resumed, code.slice(0, split));
    resumed.set({ done: true });
    resumed.set({ done: false });
    streamCode(resumed, code, split);

    const unbroken = mountComponent(HighlightStream, { language: javascript });
    streamCode(unbroken, code);

    expect(resumed.target.innerHTML).toContain("f2");
    expect(resumed.target.innerHTML).toBe(unbroken.target.innerHTML);

    resumed.set({ done: true });
    unbroken.set({ done: true });
    expect(resumed.target.innerHTML).toBe(unbroken.target.innerHTML);
    resumed.destroy();
    unbroken.destroy();
  });
});
