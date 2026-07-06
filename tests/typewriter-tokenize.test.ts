import { tokenizeTypewriter } from "../src/typewriter-units.js";

describe("tokenizeTypewriter", () => {
  it("counts one visible unit per plain character", () => {
    const units = tokenizeTypewriter("abc");
    expect(units).toEqual([
      { raw: "a", visible: 1 },
      { raw: "b", visible: 1 },
      { raw: "c", visible: 1 },
    ]);
  });

  it("counts an HTML entity as a single visible unit", () => {
    const units = tokenizeTypewriter("a&amp;b");
    expect(units.map((u) => u.raw)).toEqual(["a", "&amp;", "b"]);
    expect(units.every((u) => u.visible === 1)).toBe(true);
  });

  it("never splits a tag, and tags carry zero visible chars", () => {
    const units = tokenizeTypewriter('<span class="hljs-keyword">const</span>');
    expect(units[0]).toEqual({
      raw: '<span class="hljs-keyword">',
      visible: 0,
      kind: "open",
      name: "span",
    });
    expect(units[units.length - 1]).toEqual({
      raw: "</span>",
      visible: 0,
      kind: "close",
      name: "span",
    });
    expect(units.reduce((sum, u) => sum + u.visible, 0)).toBe(5);
  });

  it("handles a self-closing tag as zero visible chars of its own kind", () => {
    const units = tokenizeTypewriter("a<br/>b");
    expect(units).toEqual([
      { raw: "a", visible: 1 },
      { raw: "<br/>", visible: 0, kind: "self", name: "br" },
      { raw: "b", visible: 1 },
    ]);
  });

  it("does not split a multibyte emoji across surrogate halves", () => {
    const emoji = "\u{1F600}"; // 😀, a surrogate pair
    const units = tokenizeTypewriter(`a${emoji}b`);

    expect(units).toEqual([
      { raw: "a", visible: 1 },
      { raw: emoji, visible: 1 },
      { raw: "b", visible: 1 },
    ]);
    // The emoji unit must contain both surrogate halves together.
    expect(units[1]?.raw.length).toBe(2);
  });
});
