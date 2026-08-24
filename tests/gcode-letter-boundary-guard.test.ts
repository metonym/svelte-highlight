import hljsFactory from "highlight.js/lib/core";
import hljsGcode from "highlight.js/lib/languages/gcode";
import { createRegistry } from "../src/engine.js";
import gcode from "../src/languages/gcode.js";

// gcode's G/M/T/O/axis/parameter rules use `\b` for the common case, plus a
// second begin-only variant guarded by an `on:begin` callback
// (LETTER_BOUNDARY_CALLBACK) that stands in for a negative lookbehind hljs
// can't yet use: accept at input start or right after a digit/underscore,
// reject otherwise. The engine reproduces it declaratively as
// `letterBoundaryGuard` (Tokenizer#beginGuard in src/engine.js). See
// src/convert-language.js's `recognizeCallbacks` for the conversion.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("gcode", hljsGcode);

const registry = createRegistry();
registry.register(gcode.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "gcode" }).value;
  const actual = registry.highlight(code, { language: "gcode" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("gcode letter-boundary guard (letterBoundaryGuard)", () => {
  it("a G-code directly after a digit (no space) still opens title.function", () => {
    // N10G1 - the callback's own reason for existing: \b doesn't fire
    // between "0" and "G", but the digit-before case is explicitly allowed.
    const html = expectMatchesHljs("N10G1X0Y0");
    expect(html).toContain("hljs-title function_");
  });

  it("an M-code at input start still opens title.function", () => {
    const html = expectMatchesHljs("M6 T1");
    expect(html).toContain("hljs-title function_");
  });

  it("a G-code immediately after a letter is not treated as a code", () => {
    // XG1 - preceded by a letter, so neither the \b variant nor the
    // callback-guarded variant should match "G1".
    const html = expectMatchesHljs("XG1");
    expect(html).not.toContain("hljs-title function_");
  });

  it("a subroutine id directly after a digit still opens symbol", () => {
    const html = expectMatchesHljs("N5O100");
    expect(html).toContain("hljs-symbol");
  });
});
