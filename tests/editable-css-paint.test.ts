import { lineTokenRanges } from "../src/editable-css-paint.js";
import { createRegistry, registerAll, toRanges } from "../src/engine.js";
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
