import { createRegistry } from "../src/engine.js";

import fennel from "../src/languages/fennel";

const registry = createRegistry();

registry.register(fennel.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "fennel" }).value;

test("fennel highlights special forms", () => {
  const result = highlight("(fn add [a b]\n  (+ a b))");

  expect(result).toContain('<span class="hljs-keyword">fn</span>');
});

test("fennel highlights :keyword strings distinctly from regular strings", () => {
  const result = highlight('(local greeting :hello)\n(print "done")');

  expect(result).toContain('<span class="hljs-symbol">:hello</span>');
  expect(result).toContain('<span class="hljs-string">&quot;done&quot;</span>');
});

test("fennel highlights Lua built-ins", () => {
  const result = highlight("(each [i v (ipairs [1 2 3])]\n  (print i v))");

  expect(result).toContain('<span class="hljs-built_in">ipairs</span>');
  expect(result).toContain('<span class="hljs-built_in">print</span>');
});

test("fennel highlights line comments and numbers", () => {
  const result = highlight(";; a comment\n(local x 0x1F)");

  expect(result).toContain('<span class="hljs-comment">;; a comment</span>');
  expect(result).toContain('<span class="hljs-number">0x1F</span>');
});
