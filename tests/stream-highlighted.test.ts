import { createCompletedHtmlBuffer } from "../src/stream-highlighted.js";

describe("createCompletedHtmlBuffer", () => {
  it("appends completed lines with newline separators", () => {
    const buf = createCompletedHtmlBuffer();
    buf.appendLines(["a", "b"]);
    buf.appendLines(["c"]);
    expect(buf.toString()).toBe("a\nb\nc");
    expect(buf.lineCount).toBe(3);
  });

  it("does not rebuild prior content when appending (same string grows)", () => {
    const buf = createCompletedHtmlBuffer();
    buf.appendLines(["line-0"]);
    const afterFirst = buf.toString();
    buf.appendLines(["line-1", "line-2"]);
    // Prior characters remain a prefix of the new value — append-only contract.
    expect(buf.toString().startsWith(afterFirst)).toBe(true);
    expect(buf.toString()).toBe("line-0\nline-1\nline-2");
  });

  it("reset clears the buffer", () => {
    const buf = createCompletedHtmlBuffer();
    buf.appendLines(["x"]);
    buf.reset();
    expect(buf.toString()).toBe("");
    expect(buf.lineCount).toBe(0);
    buf.appendLines(["y"]);
    expect(buf.toString()).toBe("y");
  });
});
