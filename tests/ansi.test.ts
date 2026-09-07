import { parseAnsi } from "../src/ansi.js";

const ESC = "\x1b";

describe("parseAnsi", () => {
  it("returns a single plain segment for text without escapes", () => {
    expect(parseAnsi("hello world")).toEqual([{ text: "hello world" }]);
  });

  it("returns an empty array for empty input", () => {
    expect(parseAnsi("")).toEqual([]);
  });

  it("parses a standard foreground color", () => {
    expect(parseAnsi(`${ESC}[31mred`)).toEqual([
      { text: "red", fg: { name: "red" } },
    ]);
  });

  it("parses a standard background color", () => {
    expect(parseAnsi(`${ESC}[42mgreen-bg`)).toEqual([
      { text: "green-bg", bg: { name: "green" } },
    ]);
  });

  it("parses bright foreground and background colors", () => {
    expect(parseAnsi(`${ESC}[91mx`)).toEqual([
      { text: "x", fg: { name: "bright-red" } },
    ]);
    expect(parseAnsi(`${ESC}[102my`)).toEqual([
      { text: "y", bg: { name: "bright-green" } },
    ]);
  });

  it("parses bold, dim, italic and underline", () => {
    expect(parseAnsi(`${ESC}[1mb`)).toEqual([{ text: "b", bold: true }]);
    expect(parseAnsi(`${ESC}[2md`)).toEqual([{ text: "d", dim: true }]);
    expect(parseAnsi(`${ESC}[3mi`)).toEqual([{ text: "i", italic: true }]);
    expect(parseAnsi(`${ESC}[4mu`)).toEqual([{ text: "u", underline: true }]);
  });

  it("combines multiple attributes in one sequence", () => {
    expect(parseAnsi(`${ESC}[1;4;31mx`)).toEqual([
      { text: "x", bold: true, underline: true, fg: { name: "red" } },
    ]);
  });

  it("parses 256-color codes, normalizing the first 16 to named colors", () => {
    expect(parseAnsi(`${ESC}[38;5;1mx`)).toEqual([
      { text: "x", fg: { name: "red" } },
    ]);
    expect(parseAnsi(`${ESC}[38;5;9mx`)).toEqual([
      { text: "x", fg: { name: "bright-red" } },
    ]);
    expect(parseAnsi(`${ESC}[38;5;200mx`)).toEqual([
      { text: "x", fg: { index: 200 } },
    ]);
    expect(parseAnsi(`${ESC}[48;5;236mx`)).toEqual([
      { text: "x", bg: { index: 236 } },
    ]);
  });

  it("parses 24-bit truecolor codes", () => {
    expect(parseAnsi(`${ESC}[38;2;10;20;30mx`)).toEqual([
      { text: "x", fg: { rgb: [10, 20, 30] } },
    ]);
  });

  it("resets all attributes on code 0", () => {
    expect(parseAnsi(`${ESC}[1;31mA${ESC}[0mB`)).toEqual([
      { text: "A", bold: true, fg: { name: "red" } },
      { text: "B" },
    ]);
  });

  it("treats an empty SGR sequence as a reset", () => {
    expect(parseAnsi(`${ESC}[1mA${ESC}[mB`)).toEqual([
      { text: "A", bold: true },
      { text: "B" },
    ]);
  });

  it("clears individual attributes (22/23/24/39/49)", () => {
    expect(parseAnsi(`${ESC}[1mA${ESC}[22mB`)).toEqual([
      { text: "A", bold: true },
      { text: "B" },
    ]);
    expect(parseAnsi(`${ESC}[31mA${ESC}[39mB`)).toEqual([
      { text: "A", fg: { name: "red" } },
      { text: "B" },
    ]);
    expect(parseAnsi(`${ESC}[41mA${ESC}[49mB`)).toEqual([
      { text: "A", bg: { name: "red" } },
      { text: "B" },
    ]);
  });

  it("carries styling across multiple runs until changed", () => {
    expect(parseAnsi(`${ESC}[32mA B${ESC}[34mC`)).toEqual([
      { text: "A B", fg: { name: "green" } },
      { text: "C", fg: { name: "blue" } },
    ]);
  });

  it("ignores unsupported SGR codes safely", () => {
    expect(parseAnsi(`${ESC}[53mx`)).toEqual([{ text: "x" }]);
  });

  it("skips non-SGR CSI sequences (e.g. cursor moves)", () => {
    expect(parseAnsi(`${ESC}[2Jhello`)).toEqual([{ text: "hello" }]);
    expect(parseAnsi(`a${ESC}[Kb`)).toEqual([{ text: "ab" }]);
  });

  it("drops an unterminated escape sequence without throwing", () => {
    expect(parseAnsi(`ok${ESC}[31`)).toEqual([{ text: "ok" }]);
    expect(() => parseAnsi(`${ESC}[`)).not.toThrow();
    expect(parseAnsi(`${ESC}[`)).toEqual([]);
  });

  it("does not emit empty segments between adjacent codes", () => {
    expect(parseAnsi(`${ESC}[31m${ESC}[1mx`)).toEqual([
      { text: "x", bold: true, fg: { name: "red" } },
    ]);
  });

  it("parses an OSC 8 hyperlink into a segment with a link field", () => {
    expect(
      parseAnsi(`${ESC}]8;;https://example.com${ESC}\\text${ESC}]8;;${ESC}\\`),
    ).toEqual([{ text: "text", link: "https://example.com" }]);
  });

  it("terminates an OSC 8 hyperlink with a BEL", () => {
    expect(
      parseAnsi(`${ESC}]8;;https://example.com\x07text${ESC}]8;;\x07`),
    ).toEqual([{ text: "text", link: "https://example.com" }]);
  });

  it("strips an OSC 2 title-set sequence, leaving surrounding text intact", () => {
    expect(parseAnsi(`before${ESC}]2;My Title${ESC}\\after`)).toEqual([
      { text: "beforeafter" },
    ]);
  });

  it("collapses carriage-return overwrites to the final frame", () => {
    expect(parseAnsi("building 50%\rbuilding 100%\rdone")).toEqual([
      { text: "done" },
    ]);
  });

  it("treats \\r\\n as a plain newline", () => {
    expect(parseAnsi("a\r\nb")).toEqual([{ text: "a\nb" }]);
  });

  it("applies reverse video by swapping fg/bg in the parsed segment", () => {
    expect(parseAnsi(`${ESC}[7;31mx`)).toEqual([
      { text: "x", bg: { name: "red" } },
    ]);
  });

  it("clears reverse video on SGR 27", () => {
    expect(parseAnsi(`${ESC}[7;31mA${ESC}[27mB`)).toEqual([
      { text: "A", bg: { name: "red" } },
      { text: "B", fg: { name: "red" } },
    ]);
  });

  it("parses strikethrough and clears it on SGR 29", () => {
    expect(parseAnsi(`${ESC}[9mA${ESC}[29mB`)).toEqual([
      { text: "A", strikethrough: true },
      { text: "B" },
    ]);
  });

  it("parses conceal and clears it on SGR 28", () => {
    expect(parseAnsi(`${ESC}[8mA${ESC}[28mB`)).toEqual([
      { text: "A", conceal: true },
      { text: "B" },
    ]);
  });

  it("treats SGR 21 as underline", () => {
    expect(parseAnsi(`${ESC}[21mx`)).toEqual([{ text: "x", underline: true }]);
  });

  it("drops an unterminated OSC sequence without throwing", () => {
    expect(() => parseAnsi(`${ESC}]8;;https://example.com`)).not.toThrow();
    expect(parseAnsi(`ok${ESC}]8;;https://example.com`)).toEqual([
      { text: "ok" },
    ]);
  });

  it("rejects an OSC 8 hyperlink with a disallowed scheme", () => {
    expect(
      parseAnsi(`${ESC}]8;;javascript:alert(1)${ESC}\\click${ESC}]8;;${ESC}\\`),
    ).toEqual([{ text: "click" }]);
  });

  it("accepts OSC 8 schemes case-insensitively", () => {
    expect(
      parseAnsi(`${ESC}]8;;HTTPS://example.com${ESC}\\x${ESC}]8;;${ESC}\\`),
    ).toEqual([{ text: "x", link: "HTTPS://example.com" }]);
  });

  it("accepts a mailto OSC 8 hyperlink", () => {
    expect(
      parseAnsi(`${ESC}]8;;mailto:a@b.c${ESC}\\x${ESC}]8;;${ESC}\\`),
    ).toEqual([{ text: "x", link: "mailto:a@b.c" }]);
  });

  it("links a valid OSC 8 hyperlink following a rejected one", () => {
    expect(
      parseAnsi(
        `${ESC}]8;;javascript:alert(1)${ESC}\\a${ESC}]8;;https://example.com${ESC}\\b${ESC}]8;;${ESC}\\`,
      ),
    ).toEqual([{ text: "a" }, { text: "b", link: "https://example.com" }]);
  });

  it("closes a previously open link when a rejected OSC 8 uri follows", () => {
    expect(
      parseAnsi(
        `${ESC}]8;;https://example.com${ESC}\\a${ESC}]8;;javascript:alert(1)${ESC}\\b`,
      ),
    ).toEqual([{ text: "a", link: "https://example.com" }, { text: "b" }]);
  });

  it("skips a DCS sequence terminated by ST", () => {
    expect(parseAnsi(`a${ESC}P1$q"p${ESC}\\b`)).toEqual([{ text: "ab" }]);
  });

  it("skips an SOS sequence terminated by BEL", () => {
    expect(parseAnsi(`a${ESC}Xjunk\x07b`)).toEqual([{ text: "ab" }]);
  });

  it("skips a PM sequence terminated by ST", () => {
    expect(parseAnsi(`a${ESC}^junk${ESC}\\b`)).toEqual([{ text: "ab" }]);
  });

  it("skips an APC sequence terminated by BEL", () => {
    expect(parseAnsi(`a${ESC}_junk\x07b`)).toEqual([{ text: "ab" }]);
  });

  it("drops the rest of the input on an unterminated DCS/SOS/PM/APC sequence", () => {
    expect(parseAnsi(`a${ESC}Pjunk`)).toEqual([{ text: "a" }]);
    expect(parseAnsi(`a${ESC}_junk`)).toEqual([{ text: "a" }]);
  });

  it("skips a charset select sequence", () => {
    expect(parseAnsi(`a${ESC}(Bb`)).toEqual([{ text: "ab" }]);
    expect(parseAnsi(`a${ESC}0b`)).toEqual([{ text: "ab" }]);
  });

  it("drops a single-character escape (reset, cursor save/restore, etc.)", () => {
    expect(parseAnsi(`a${ESC}cb`)).toEqual([{ text: "ab" }]);
    expect(parseAnsi(`a${ESC}7b`)).toEqual([{ text: "ab" }]);
    expect(parseAnsi(`a${ESC}8b`)).toEqual([{ text: "ab" }]);
    expect(parseAnsi(`a${ESC}=b`)).toEqual([{ text: "ab" }]);
    expect(parseAnsi(`a${ESC}>b`)).toEqual([{ text: "ab" }]);
    expect(parseAnsi(`a${ESC}Mb`)).toEqual([{ text: "ab" }]);
  });

  it("drops a trailing lone ESC without throwing", () => {
    expect(parseAnsi(`a${ESC}`)).toEqual([{ text: "a" }]);
  });

  it("never leaks an escape byte into segment text (seeded fuzz)", () => {
    // Deterministic PRNG (mulberry32) so failures reproduce across runs.
    let state = 0x5eed1e55;
    const next = () => {
      state |= 0;
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const alphabet = [
      ..."ABCabc019 \t",
      ESC,
      "[",
      "]",
      ";",
      "m",
      "\r",
      "\n",
      "\x07",
      "\\",
      "P",
      "X",
      "^",
      "_",
    ];

    for (let trial = 0; trial < 200; trial += 1) {
      const length = Math.floor(next() * 201);
      let input = "";
      for (let k = 0; k < length; k += 1) {
        input += alphabet[Math.floor(next() * alphabet.length)];
      }

      let segments: ReturnType<typeof parseAnsi> = [];
      expect(() => {
        segments = parseAnsi(input);
      }).not.toThrow();
      for (const segment of segments) {
        expect(segment.text.includes(ESC)).toBe(false);
      }

      // `\r` has its own pre-existing overwrite semantics (unrelated to
      // escape handling) that rewrite text even without any ESC byte, so
      // the identity check only applies when neither is present.
      if (!input.includes(ESC) && !input.includes("\r")) {
        expect(segments.map((s) => s.text).join("")).toBe(input);
      }
    }
  });
});
