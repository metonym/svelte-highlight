import { splitLines } from "../src/split-lines.js";

describe("splitLines", () => {
  it("closes and reopens a span that wraps a block comment across lines", () => {
    const html = '<span class="hljs-comment">/* line1\nline2\nline3 */</span>';
    const lines = splitLines(html);

    expect(lines).toEqual([
      '<span class="hljs-comment">/* line1</span>',
      '<span class="hljs-comment">line2</span>',
      '<span class="hljs-comment">line3 */</span>',
    ]);

    for (const line of lines) {
      expect(line.startsWith('<span class="hljs-comment">')).toBe(true);
      expect(line.endsWith("</span>")).toBe(true);
    }
  });

  it("re-opens the full nested stack, in order, on the next line", () => {
    const html =
      // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
      '<span class="hljs-string">`a\n<span class="hljs-subst">${b}</span>\nc`</span>';
    const lines = splitLines(html);

    expect(lines).toEqual([
      '<span class="hljs-string">`a</span>',
      // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
      '<span class="hljs-string"><span class="hljs-subst">${b}</span></span>',
      '<span class="hljs-string">c`</span>',
    ]);
  });

  it("passes plain lines through unchanged", () => {
    const html = "const a = 1;\nconst b = 2;";
    expect(splitLines(html)).toEqual(["const a = 1;", "const b = 2;"]);
  });

  it('yields the same line count as split("\\n") for trailing newlines', () => {
    const html = "a\nb\n";
    expect(splitLines(html)).toEqual(html.split("\n"));
  });

  it("preserves attributes exactly on re-opened spans", () => {
    const html = '<span class="hljs-comment" data-foo="bar">a\nb</span>';
    const lines = splitLines(html);

    expect(lines).toEqual([
      '<span class="hljs-comment" data-foo="bar">a</span>',
      '<span class="hljs-comment" data-foo="bar">b</span>',
    ]);
  });
});
