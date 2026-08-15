import { buildSealedChunkHtml } from "../src/stream-sealed-chunks.js";

describe("buildSealedChunkHtml", () => {
  it("returns an empty string for no lines", () => {
    expect(buildSealedChunkHtml([], 0)).toBe("");
  });

  it("wraps a single line at the start of the document without a leading newline", () => {
    expect(buildSealedChunkHtml(["<span>a</span>"], 0)).toBe(
      '<span class="highlight-stream-line" data-line="0"><span>a</span></span>',
    );
  });

  it("separates multiple lines with newlines and indexes them sequentially", () => {
    expect(buildSealedChunkHtml(["a", "b", "c"], 0)).toBe(
      '<span class="highlight-stream-line" data-line="0">a</span>\n' +
        '<span class="highlight-stream-line" data-line="1">b</span>\n' +
        '<span class="highlight-stream-line" data-line="2">c</span>',
    );
  });

  it("offsets data-line by startLine for a chunk mid-stream, with a leading newline to separate from the prior chunk", () => {
    expect(buildSealedChunkHtml(["a", "b"], 256)).toBe(
      '\n<span class="highlight-stream-line" data-line="256">a</span>\n' +
        '<span class="highlight-stream-line" data-line="257">b</span>',
    );
  });
});
