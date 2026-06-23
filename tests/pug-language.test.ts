import hljs from "highlight.js/lib/core";
import pug from "../src/languages/pug";

hljs.registerLanguage(pug.name, pug.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "pug" }).value;

test("pug highlights doctype as meta", () => {
  const result = highlight("doctype html");

  expect(result).toContain('<span class="hljs-meta">doctype html</span>');
});

test("pug highlights tags", () => {
  const result = highlight("h1 Hello");

  expect(result).toContain('<span class="hljs-selector-tag">h1</span>');
});

test("pug highlights id and class shorthand", () => {
  const result = highlight("h1#title.big Hello");

  expect(result).toContain('<span class="hljs-selector-id">#title</span>');
  expect(result).toContain('<span class="hljs-selector-class">.big</span>');
});

test("pug highlights mixin calls", () => {
  const result = highlight("+button('Save')");

  expect(result).toContain('<span class="hljs-keyword">+button</span>');
});
