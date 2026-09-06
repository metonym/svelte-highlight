import { createRegistry } from "../src/engine.js";

import uiua from "../src/languages/uiua";

const registry = createRegistry();

registry.register(uiua.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "uiua" }).value;

test("uiua highlights the binding arrow as the relevance carrier", () => {
  const result = highlight("Double ← ×2");

  expect(result).toContain('<span class="hljs-operator">←</span>');
  expect(result).toContain('<span class="hljs-title function_">Double</span>');
});

test("uiua highlights stack glyphs as built-ins", () => {
  const result = highlight("/+ ≡Double [1 2 3 4]");

  expect(result).toContain('<span class="hljs-built_in">/</span>');
  expect(result).toContain('<span class="hljs-built_in">≡</span>');
});

test("uiua highlights ASCII-spelled primitives", () => {
  const result = highlight("dup flip over");

  expect(result).toContain('<span class="hljs-built_in">dup</span>');
});

test("uiua highlights format strings and comments", () => {
  const result = highlight('# a comment\n&p $"Total: _" Total');

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain('<span class="hljs-string">');
});

test("uiua highlights numbers", () => {
  const result = highlight("×2");

  expect(result).toContain('<span class="hljs-number">2</span>');
});
