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
