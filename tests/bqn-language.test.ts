import { createRegistry } from "../src/engine.js";

import bqn from "../src/languages/bqn";

const registry = createRegistry();

registry.register(bqn.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "bqn" }).value;

test("bqn highlights the define arrow as the relevance carrier", () => {
  const result = highlight("Double ⇐ ×2");

  expect(result).toContain('<span class="hljs-operator">⇐</span>');
});

test("bqn highlights system values as built-ins", () => {
  const result = highlight("•Show Total");

  expect(result).toContain('<span class="hljs-built_in">•Show</span>');
});

test("bqn highlights uppercase function names", () => {
  const result = highlight("Sum ← +´");

  expect(result).toContain('<span class="hljs-title function_">Sum</span>');
});

test("bqn highlights primitive glyphs as built-ins", () => {
  const result = highlight("+´");

  expect(result).toContain('<span class="hljs-built_in">+</span>');
});

test("bqn highlights comments and numbers", () => {
  const result = highlight("# a comment\nx ← 42");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain('<span class="hljs-number">42</span>');
});

test("bqn highlights dotted system values like •file.Lines", () => {
  const result = highlight('•Show •file.Lines "t"\n•args •path •Out');

  expect(result).toContain('<span class="hljs-built_in">•Show</span>');
  expect(result).toContain('<span class="hljs-built_in">•file.Lines</span>');
  expect(result).toContain('<span class="hljs-built_in">•args</span>');
  expect(result).toContain('<span class="hljs-built_in">•path</span>');
  expect(result).toContain('<span class="hljs-built_in">•Out</span>');
});

test("bqn does not treat a bare identifier as a system value", () => {
  const result = highlight("Show ← 1\nfile ← 2");

  expect(result).toContain('<span class="hljs-title function_">Show</span>');
  expect(result).not.toContain('<span class="hljs-built_in">•Show</span>');
  expect(result).toContain("file");
  expect(result).not.toContain('<span class="hljs-built_in">•file</span>');
});
