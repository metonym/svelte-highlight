import javascript from "../src/languages/javascript.js";
import { registry } from "../src/registry.js";
import { createFinalHighlighter } from "../src/stream-final-highlight.js";
import {
  createStreamHighlighter,
  SEAL_CHUNK_LINES,
} from "../src/stream-highlighter.js";

const stripTags = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");

/** Joins sealed chunks and tail lines the way the component renders them. */
function rendered(
  state: ReturnType<ReturnType<typeof createStreamHighlighter>["update"]>,
) {
  const tail = state.tailLines
    .map((line, i) => (state.sealedLineCount + i > 0 ? `\n${line}` : line))
    .join("");
  return stripTags(state.sealedChunks.join("") + tail);
}

function streamIn(code: string, step: number) {
  const stream = createStreamHighlighter();
  let state = stream.update("", javascript);
  for (let end = step; end < code.length + step; end += step) {
    state = stream.update(code.slice(0, end), javascript);
  }
  return { stream, state };
}

describe("createStreamHighlighter", () => {
  // A template literal across lines keeps a scope open between chunks.
  const code = [
    "const a = `x",
    "$" + "{1}`;",
    "// done",
    "function f() {",
    "  return 1;",
    "}",
    "",
  ].join("\n");

  it("renders the streamed text in sealed chunks plus tail lines", () => {
    for (const step of [1, 3, 7]) {
      const { state } = streamIn(code, step);
      expect(rendered(state)).toBe(code);
      expect(stripTags(state.highlighted)).toBe(code);
    }
  });

  it("matches a full highlight once finished", () => {
    const { stream } = streamIn(code, 5);
    const final = stream.finish(code, javascript);
    expect(final.highlighted).toBe(
      createFinalHighlighter().highlight(registry, code, "javascript"),
    );
    expect(final.sealedChunks).toEqual([]);
    expect(final.tailLines).toEqual([]);
  });

  it("seals full chunks and keeps the tail bounded", () => {
    const long = "let x = 1;\n".repeat(SEAL_CHUNK_LINES * 2 + 10);
    const { state } = streamIn(long, 400);
    expect(state.sealedLineCount).toBe(SEAL_CHUNK_LINES * 2);
    expect(state.sealedChunks).toHaveLength(2);
    expect(state.tailLines.length).toBeLessThan(SEAL_CHUNK_LINES);
    expect(rendered(state)).toBe(long);
  });

  it("handles an edit that is not an append", () => {
    const { stream } = streamIn(code, 4);
    const edited = code.replace("return 1", "return 2");
    expect(rendered(stream.update(edited, javascript))).toBe(edited);
    const shorter = edited.slice(0, 20);
    expect(rendered(stream.update(shorter, javascript))).toBe(shorter);
  });

  it("restarts after finish", () => {
    const { stream } = streamIn(code, 6);
    stream.finish(code, javascript);
    const more = `${code}let b;`;
    expect(rendered(stream.update(more, javascript))).toBe(more);
  });
});
