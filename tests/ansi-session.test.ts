import { createAnsiSession, parseAnsi } from "../src/ansi.js";

const ESC = "\x1b";

/**
 * Feed `input` into a fresh session split at every possible boundary (two
 * `append()` calls), asserting `finish()` always matches a plain
 * `parseAnsi(input)` regardless of where the split falls.
 */
function expectSameAtEverySplit(input: string) {
  for (let k = 0; k <= input.length; k += 1) {
    const session = createAnsiSession();
    session.append(input.slice(0, k));
    session.append(input.slice(k));
    expect(session.finish()).toEqual(parseAnsi(input));
  }
}

describe("createAnsiSession", () => {
  it("matches parseAnsi for plain text split at every boundary", () => {
    expectSameAtEverySplit("hello world");
  });

  it("matches parseAnsi for one styled word split at every boundary", () => {
    expectSameAtEverySplit(`${ESC}[1;31mhello${ESC}[0m world`);
  });

  it("matches parseAnsi for multiple colors split at every boundary", () => {
    expectSameAtEverySplit(
      `${ESC}[32mA B${ESC}[34mC${ESC}[0m ${ESC}[38;5;208mD${ESC}[0m`,
    );
  });

  it("matches parseAnsi for an OSC 8 link split at every boundary", () => {
    expectSameAtEverySplit(
      `see ${ESC}]8;;https://example.com${ESC}\\docs${ESC}]8;;${ESC}\\ here`,
    );
  });

  it("matches parseAnsi for a \\r overwrite split at every boundary", () => {
    expectSameAtEverySplit("building 50%\rbuilding 100%\rdone");
  });

  it("matches parseAnsi for \\r\\n split at every boundary", () => {
    expectSameAtEverySplit("a\r\nb");
  });

  it("holds back an SGR sequence split mid-parameter", () => {
    const session = createAnsiSession();
    session.append(`a${ESC}[3`);
    // Mid-stream: the split SGR is still pending, so only "a" is settled.
    expect(session.segments()).toEqual([{ text: "a" }]);
    session.append("2mred");
    expect(session.finish()).toEqual(parseAnsi(`a${ESC}[32mred`));
  });

  it("holds back an OSC 8 sequence split mid-URI", () => {
    const session = createAnsiSession();
    session.append(`${ESC}]8;;http`);
    expect(session.segments()).toEqual([]);
    session.append(`s://example.com${ESC}\\x${ESC}]8;;${ESC}\\`);
    expect(session.finish()).toEqual(
      parseAnsi(`${ESC}]8;;https://example.com${ESC}\\x${ESC}]8;;${ESC}\\`),
    );
  });

  it("holds back a lone trailing ESC", () => {
    const session = createAnsiSession();
    session.append(`a${ESC}`);
    expect(session.segments()).toEqual([{ text: "a" }]);
    session.append("[31mb");
    expect(session.finish()).toEqual(parseAnsi(`a${ESC}[31mb`));
  });

  it("collapses a lone trailing \\r immediately followed by \\n in the next chunk", () => {
    const session = createAnsiSession();
    session.append("a\r");
    session.append("\nb");
    expect(session.finish()).toEqual(parseAnsi("a\r\nb"));
  });

  it("resolves a lone trailing \\r as an overwrite when the session ends there", () => {
    const session = createAnsiSession();
    session.append("building 50%\rdone");
    session.append("\r");
    expect(session.finish()).toEqual(parseAnsi("building 50%\rdone\r"));
  });

  it("reflects the completed prefix plus a live trailing segment mid-stream", () => {
    const session = createAnsiSession();
    session.append(`before${ESC}[31m`);
    expect(session.segments()).toEqual([{ text: "before" }]);
    session.append("red text");
    expect(session.segments()).toEqual([
      { text: "before" },
      { text: "red text", fg: { name: "red" } },
    ]);
    // Calling segments() again does not mutate state.
    expect(session.segments()).toEqual([
      { text: "before" },
      { text: "red text", fg: { name: "red" } },
    ]);
  });

  it("does not mutate state when reading segments() without finishing", () => {
    const session = createAnsiSession();
    session.append("abc");
    session.segments();
    session.append("def");
    expect(session.finish()).toEqual([{ text: "abcdef" }]);
  });
});
