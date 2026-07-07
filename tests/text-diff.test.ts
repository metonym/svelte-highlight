import { diffText } from "../src/text-diff.js";

describe("diffText", () => {
  it("returns an empty diff for identical strings", () => {
    expect(diffText("abc", "abc")).toEqual({
      start: 3,
      removed: "",
      inserted: "",
    });
  });

  it("trims a pure insert to just the inserted text", () => {
    expect(diffText("ab", "aXb")).toEqual({
      start: 1,
      removed: "",
      inserted: "X",
    });
  });

  it("trims a pure delete to just the removed text", () => {
    expect(diffText("aXb", "ab")).toEqual({
      start: 1,
      removed: "X",
      inserted: "",
    });
  });

  it("treats a full replacement as one span with no shared prefix/suffix", () => {
    expect(diffText("abc", "xyz")).toEqual({
      start: 0,
      removed: "abc",
      inserted: "xyz",
    });
  });

  it("does not split a surrogate pair shared between prefix and change", () => {
    // "\u{1F600}" (😀) and "\u{1F605}" (😅) share a leading high surrogate.
    const before = "a\u{1F600}";
    const after = "a\u{1F605}";
    const diff = diffText(before, after);

    expect(diff).toEqual({ start: 1, removed: "\u{1F600}", inserted: "\u{1F605}" });
    expect(before.slice(diff.start, diff.start + diff.removed.length)).toBe(
      "\u{1F600}",
    );
  });

  it("does not split a surrogate pair shared between change and suffix", () => {
    // Two different emoji that happen to share the same low surrogate unit.
    const before = "A😀";
    const after = "B𐈀";
    const diff = diffText(before, after);

    expect(diff).toEqual({
      start: 0,
      removed: "A😀",
      inserted: "B𐈀",
    });
  });

  it("reconstructs both strings via the returned splice", () => {
    const before = "const a = 1;";
    const after = "const abc = 12;";
    const { start, removed, inserted } = diffText(before, after);

    expect(before.slice(0, start) + removed + before.slice(start + removed.length)).toBe(
      before,
    );
    expect(
      before.slice(0, start) + inserted + before.slice(start + removed.length),
    ).toBe(after);
  });
});
