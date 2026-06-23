import hljs from "highlight.js/lib/core";
import odin from "../src/languages/odin";

hljs.registerLanguage(odin.name, odin.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "odin" }).value;

test("odin highlights proc keyword", () => {
  const result = highlight("main :: proc() {}");

  expect(result).toContain('<span class="hljs-keyword">proc</span>');
});

test("odin highlights package and import keywords", () => {
  const result = highlight('package main\nimport "core:fmt"');

  expect(result).toContain('<span class="hljs-keyword">package</span>');
  expect(result).toContain('<span class="hljs-keyword">import</span>');
});

test("odin highlights builtin types", () => {
  const result = highlight("x: int = 5");

  expect(result).toContain('<span class="hljs-type">int</span>');
});

test("odin highlights directives as meta", () => {
  const result = highlight("#partial switch x {}");

  expect(result).toContain('<span class="hljs-meta">#partial</span>');
});
