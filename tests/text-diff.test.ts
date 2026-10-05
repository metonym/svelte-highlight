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

    expect(diff).toEqual({
      start: 1,
      removed: "\u{1F600}",
      inserted: "\u{1F605}",
    });
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

    expect(
      before.slice(0, start) + removed + before.slice(start + removed.length),
    ).toBe(before);
    expect(
      before.slice(0, start) + inserted + before.slice(start + removed.length),
    ).toBe(after);
  });
});

describe("diffText on long inputs", () => {
  /** Reference: the plain one-character-at-a-time trim. */
  function referenceDiff(before: string, after: string) {
    const minLength = Math.min(before.length, after.length);
    let prefix = 0;
    while (prefix < minLength && before[prefix] === after[prefix]) prefix++;
    const high = before.charCodeAt(prefix - 1);
    if (high >= 0xd800 && high <= 0xdbff) prefix--;
    let suffix = 0;
    while (
      suffix < minLength - prefix &&
      before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
    )
      suffix++;
    const low = before.charCodeAt(before.length - suffix);
    if (low >= 0xdc00 && low <= 0xdfff) suffix--;
    return {
      start: prefix,
      removed: before.slice(prefix, before.length - suffix),
      inserted: after.slice(prefix, after.length - suffix),
    };
  }

  it("matches a per-character trim across chunk boundaries", () => {
    let seed = 7;
    const random = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const units = ["a", "ab", "\n", "😀", "function x() {}\n"];
    for (let round = 0; round < 200; round++) {
      let before = "";
      const length = Math.floor(random() * 20_000);
      while (before.length < length) {
        before += units[Math.floor(random() * units.length)];
      }
      const at = Math.floor(random() * (before.length + 1));
      const removeLength = Math.floor(random() * 6);
      const insert = ["", "a", "😀", "x\ny", "aaaa"][round % 5] as string;
      const after =
        before.slice(0, at) + insert + before.slice(at + removeLength);
      expect(diffText(before, after)).toEqual(referenceDiff(before, after));
    }
  });

  it("matches on long repetitive inputs", () => {
    for (const n of [4095, 4096, 4097, 16_384, 20_000]) {
      const before = "a".repeat(n);
      for (const after of [`${before}a`, before.slice(1), `b${before}`]) {
        expect(diffText(before, after)).toEqual(referenceDiff(before, after));
      }
    }
  });
});
