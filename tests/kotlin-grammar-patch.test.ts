import hljsFactory from "highlight.js/lib/core";
import patchedKotlin from "../scripts/hljs-patches/kotlin.js";
import { createRegistry } from "../src/engine.js";
import kotlin from "../src/languages/kotlin.js";

// scripts/hljs-patches/kotlin.js: unsigned integer literal suffixes.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("kotlin", patchedKotlin.register);

const registry = createRegistry();
registry.register(kotlin.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "kotlin" }).value;
  const actual = registry.highlight(code, { language: "kotlin" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("kotlin grammar patch", () => {
  it("includes u and UL suffixes in decimal literals", () => {
    const html = expectMatchesHljs("val a = 42u\nval b = 1UL\nval c = 7uL");
    expect(html).toContain('<span class="hljs-number">42u</span>');
    expect(html).toContain('<span class="hljs-number">1UL</span>');
    expect(html).toContain('<span class="hljs-number">7uL</span>');
  });

  it("includes unsigned suffixes in hex and binary literals", () => {
    const html = expectMatchesHljs("val a = 0xFFu\nval b = 0b1010U");
    expect(html).toContain('<span class="hljs-number">0xFFu</span>');
    expect(html).toContain('<span class="hljs-number">0b1010U</span>');
  });

  it("keeps long and float literals unchanged", () => {
    const html = expectMatchesHljs("val a = 7L\nval b = 3.5f\nval c = 1e3");
    expect(html).toContain('<span class="hljs-number">7L</span>');
    expect(html).toContain('<span class="hljs-number">3.5f</span>');
    expect(html).toContain('<span class="hljs-number">1e3</span>');
  });

  it("does not swallow an identifier starting with u after a number", () => {
    const html = expectMatchesHljs("val x = 3 until 10");
    expect(html).toContain('<span class="hljs-number">3</span> until');
  });
});
