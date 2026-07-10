import hljsFactory from "highlight.js/lib/core";
import hljsJavascript from "highlight.js/lib/languages/javascript";
import hljsTypescript from "highlight.js/lib/languages/typescript";
import hljsXml from "highlight.js/lib/languages/xml";
import { createRegistry } from "../src/engine.js";
import javascript from "../src/languages/javascript.js";
import typescript from "../src/languages/typescript.js";
import xml from "../src/languages/xml.js";

// javascript/typescript's `<Foo` rule can open either a JSX tag or be a
// generic-type/comparison false start (`Array<Foo>`, `a<b`). hljs
// disambiguates via a dynamic `on:begin` callback (isTrulyOpeningTag); the
// engine reproduces it declaratively as `xmlTagGuard`
// (Tokenizer#isTrulyOpeningTag in src/engine.js). See
// src/convert-language.js's `recognizeCallbacks` for the conversion.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("javascript", hljsJavascript);
hljs.registerLanguage("typescript", hljsTypescript);
hljs.registerLanguage("xml", hljsXml);

const registry = createRegistry();
registry.register(xml.register);
registry.register(javascript.register);
registry.register(typescript.register);

function expectMatchesHljs(language: string, code: string) {
  const expected = hljs.highlight(code, { language }).value;
  const actual = registry.highlight(code, { language }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("javascript/typescript JSX-vs-generic-type guard (xmlTagGuard)", () => {
  it("real JSX still opens a tag", () => {
    const html = expectMatchesHljs(
      "javascript",
      'const el = <Foo bar="1">hello</Foo>;',
    );
    expect(html).toContain("hljs-tag");
  });

  it("self-closing JSX still opens a tag", () => {
    const html = expectMatchesHljs("javascript", 'const el = <Foo bar="1" />;');
    expect(html).toContain("hljs-tag");
  });

  it("a JSX fragment still opens a tag", () => {
    const html = expectMatchesHljs("javascript", "const frag = <>hello</>;");
    expect(html).toContain("hljs-tag");
  });

  it("a generic type instantiation is not treated as a tag", () => {
    const html = expectMatchesHljs(
      "typescript",
      "const m: Map<string, Array<number>> = new Map();",
    );
    expect(html).not.toContain("hljs-tag");
  });

  it("a bare `<`/`>` comparison is not treated as a tag", () => {
    const html = expectMatchesHljs("typescript", "const cmp = a < b > c;");
    expect(html).not.toContain("hljs-tag");
  });

  it("a generic constraint (`extends`) is not treated as a tag", () => {
    const html = expectMatchesHljs(
      "typescript",
      "function f<T extends string>(x: T) {}",
    );
    expect(html).not.toContain("hljs-tag");
  });

  it("a default type parameter (`= any`) is not treated as a tag", () => {
    const html = expectMatchesHljs("typescript", "type A<T = any> = T;");
    expect(html).not.toContain("hljs-tag");
  });

  it("a same-name opening tag without a later closing tag is not treated as a tag", () => {
    // No `</Foo>` anywhere in the document - hljs's hasClosingTag scan fails,
    // so this is left as plain text rather than an unterminated JSX tag.
    const html = expectMatchesHljs("javascript", "const cmp = a <Foo> b;");
    expect(html).not.toContain("hljs-tag");
  });
});
