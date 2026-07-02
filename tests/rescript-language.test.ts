import hljs from "highlight.js/lib/core";
import rescript from "../src/languages/rescript";

hljs.registerLanguage(rescript.name, rescript.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "rescript" }).value;

test("rescript highlights let bindings as functions", () => {
  const result = highlight("let greet = (name) => name");

  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain('<span class="hljs-title function_">greet</span>');
});

test("rescript highlights type keyword and constructors", () => {
  const result = highlight("type color = Red");

  expect(result).toContain('<span class="hljs-keyword">type</span>');
  expect(result).toContain('<span class="hljs-type">Red</span>');
});

test("rescript highlights polymorphic variants", () => {
  const result = highlight("let x = #Blue");

  expect(result).toContain('<span class="hljs-symbol">#Blue</span>');
});

test("rescript highlights strings", () => {
  const result = highlight('let s = "hi"');

  expect(result).toContain('<span class="hljs-string">&quot;hi&quot;</span>');
});

test("rescript does not mistake rec for the function name in let rec bindings", () => {
  const result = highlight("let rec fact = (n) => n");

  expect(result).toContain('<span class="hljs-keyword">rec</span>');
  expect(result).toContain('<span class="hljs-title function_">fact</span>');
  expect(result).not.toContain('<span class="hljs-title function_">rec</span>');
});

test("rescript highlights arrow functions without a parenthesized argument", () => {
  const result = highlight("let f = x => x + 1");

  expect(result).toContain('<span class="hljs-title function_">f</span>');
});

test("rescript highlights JSX tags, attributes, and expression braces", () => {
  const result = highlight('<div className="foo"> {text} </div>');

  expect(result).toContain('<span class="hljs-tag">');
  expect(result).toContain('<span class="hljs-name">div</span>');
  expect(result).toContain('<span class="hljs-attr">className</span>');
  expect(result).toContain('<span class="hljs-string">&quot;foo&quot;</span>');
  expect(result).toContain("language-javascript");
  expect(result).toContain("{text}");
});

test("rescript does not mistake generic type application for a JSX tag", () => {
  const result = highlight("let arr: array<int> = [1, 2, 3]");

  expect(result).not.toContain('<span class="hljs-tag">');
});
