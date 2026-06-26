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
});
