import { createRegistry, registerAll } from "../src/engine.js";

import pug from "../src/languages/pug";

const registry = createRegistry();

registerAll(registry, pug);

const highlight = (code: string) =>
  registry.highlight(code, { language: "pug" }).value;

test("pug highlights doctype as meta", () => {
  const result = highlight("doctype html");

  expect(result).toContain('<span class="hljs-meta">doctype html</span>');
});

test("pug highlights tags", () => {
  const result = highlight("h1 Hello");

  expect(result).toContain('<span class="hljs-selector-tag">h1</span>');
});

test("pug highlights control-flow keywords, not tag names", () => {
  const result = highlight(
    "if user.authenticated\n  p Welcome\nelse\n  p Log in\neach item in items\n  li= item",
  );

  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-keyword">else</span>');
  expect(result).toContain('<span class="hljs-keyword">each</span>');
  expect(result).not.toContain('<span class="hljs-selector-tag">if</span>');
  expect(result).not.toContain('<span class="hljs-selector-tag">else</span>');
  expect(result).not.toContain('<span class="hljs-selector-tag">each</span>');
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

test("pug highlights plain buffered comments", () => {
  const result = highlight("// a plain comment");

  expect(result).toContain(
    '<span class="hljs-comment">// a plain comment</span>',
  );
});

test("pug highlights unbuffered code lines as javascript", () => {
  const result = highlight("- var x = 1");

  expect(result).toContain("language-javascript");
  expect(result).toContain('<span class="hljs-keyword">var</span>');
});

test("pug highlights buffered and unescaped code lines as javascript", () => {
  const result = highlight("= x\n!= x");

  expect(result).toContain("language-javascript");
});
