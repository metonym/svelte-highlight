import { lineTokenRanges, retokenizedEnd } from "../src/editable-css-paint.js";
import {
  CLOSE,
  createRegistry,
  OPEN,
  registerAll,
  TEXT,
  toRanges,
} from "../src/engine.js";
import {
  CHECKPOINT_INTERVAL,
  parseIncremental,
  reparseIncremental,
} from "../src/incremental-tokenize.js";
import * as languages from "../src/languages/index.js";
import { CUSTOM_SNIPPETS } from "./differential-corpus.ts";

const registry = createRegistry();
for (const language of Object.values(languages))
  registerAll(registry, language);

/** Checks every line against whole-document toRanges clipped to the line. */
function expectMatchesClippedRanges(code: string, language: string) {
  const { events } = registry.tokenize(code, language);
  const ranges = toRanges(events);
  let lineStart = 0;
  for (const text of code.split("\n")) {
    const lineEnd = lineStart + text.length;
    const expected = ranges
      .filter((token) => token.start < lineEnd && token.end > lineStart)
      .map((token) => ({
        start: Math.max(token.start, lineStart) - lineStart,
        end: Math.min(token.end, lineEnd) - lineStart,
        scope: token.scope,
      }))
      .filter((token) => token.start !== token.end);
    expect(lineTokenRanges(events, lineStart, lineEnd)).toEqual(expected);
    lineStart = lineEnd + 1;
  }
}

describe("lineTokenRanges", () => {
  it("matches whole-document toRanges clipped to each line", () => {
    for (const [language, code] of Object.entries(CUSTOM_SNIPPETS)) {
      expectMatchesClippedRanges(code, language);
    }
    for (const code of [
      // biome-ignore lint/suspicious/noTemplateCurlyInString: JS *source text* fed to the tokenizer
      "const s = `a\n${b}\nc`;\n/* one\ntwo */ x\n\n<div>\n</div>",
      "",
      "\n\n",
    ]) {
      expectMatchesClippedRanges(code, "javascript");
    }
  });

  it("treats sublanguage wrappers as transparent, like toRanges", () => {
    expectMatchesClippedRanges(
      "<script>\nlet a = 1;\n</script>\n<style>\np { color: red }\n</style>",
      "xml",
    );
  });
});

describe("retokenizedEnd", () => {
  let code = "";
  for (let i = 0; i < CHECKPOINT_INTERVAL * 4; i++) {
    code += i === 12 ? "const v = 1; */\n" : `const v${i} = ${i};\n`;
  }
  const lines = code.split("\n");

  /** Replaces line `index`'s text, the edit HighlightEditable paints one line for. */
  function editLine(index: number, text: string) {
    const next = [...lines];
    next[index] = text;
    const nextCode = next.join("\n");
    const previous = parseIncremental(registry, "javascript", code);
    const parse = reparseIncremental(
      registry,
      "javascript",
      previous,
      nextCode,
    );
    const from = index === 0 ? 0 : lines.slice(0, index).join("\n").length + 1;
    return { previous, parse, nextCode, from };
  }

  it("leaves every later line's ranges as they were", () => {
    const edits: [number, string][] = [
      [10, "/* const v10 = 10;"],
      [10, "const v10 = `10;"],
      [40, "const v40 = 41;"],
      [CHECKPOINT_INTERVAL * 2, "const s = 'x';"],
      [lines.length - 2, "const last = 0;"],
    ];
    for (const [index, text] of edits) {
      const { previous, parse, nextCode, from } = editLine(index, text);
      const end = retokenizedEnd(
        nextCode,
        parse.events,
        previous.events,
        parse.reuse,
        from,
      );
      const lineEnd = nextCode.indexOf("\n", from);
      expect(end).toBeGreaterThanOrEqual(
        lineEnd === -1 ? nextCode.length : lineEnd,
      );
      // Same lines either side of the edited one, so a later line moves
      // by the edited line's change in length.
      const shift = text.length - (lines[index] as string).length;
      let lineStart = 0;
      for (const line of nextCode.split("\n")) {
        if (lineStart > end) {
          const lineEnd = lineStart + line.length;
          expect(lineTokenRanges(parse.events, lineStart, lineEnd)).toEqual(
            lineTokenRanges(
              previous.events,
              lineStart - shift,
              lineEnd - shift,
            ),
          );
        }
        lineStart += line.length + 1;
      }
    }
  });

  it("reaches past the edited line when the edit opens a comment", () => {
    const { previous, parse, nextCode, from } = editLine(
      10,
      "/* const v10 = 10;",
    );
    const end = retokenizedEnd(
      nextCode,
      parse.events,
      previous.events,
      parse.reuse,
      from,
    );
    // The comment runs through the `*/` on line 12.
    expect(end).toBeGreaterThanOrEqual(nextCode.indexOf("*/"));
  });

  it("finds the same end by comparing the events when there's no reuse", () => {
    const { previous, parse, nextCode, from } = editLine(
      10,
      "/* const v10 = 10;",
    );
    expect(
      retokenizedEnd(nextCode, parse.events, previous.events, undefined, from),
    ).toBe(
      retokenizedEnd(
        nextCode,
        parse.events,
        previous.events,
        parse.reuse,
        from,
      ),
    );
  });

  it("covers the rest of the document when different scopes reach the shared tail", () => {
    // The shared tail closes a string before the edit and a comment
    // after it, so its lines' ranges change too.
    const tail = [{ t: TEXT, v: "b\nc" }, { t: CLOSE }] as const;
    const previousEvents = [
      { t: OPEN, s: "string" } as const,
      { t: TEXT, v: "a\n" } as const,
      ...tail,
    ];
    const events = [
      { t: OPEN, s: "comment" } as const,
      { t: TEXT, v: "/a\n" } as const,
      ...tail,
    ];
    const code = "/a\nb\nc";
    expect(retokenizedEnd(code, events, previousEvents, undefined, 0)).toBe(
      code.length,
    );
  });

  it("covers the rest of the document when the reuse isn't from the painted events", () => {
    const { parse, nextCode, from } = editLine(40, "const v40 = 41;");
    expect(retokenizedEnd(nextCode, parse.events, [], parse.reuse, from)).toBe(
      nextCode.length,
    );
    expect(
      retokenizedEnd(nextCode, parse.events, undefined, undefined, from),
    ).toBe(nextCode.length);
  });
});
