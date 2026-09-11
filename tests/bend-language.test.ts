import { createRegistry } from "../src/engine.js";

import bend from "../src/languages/bend";

const registry = createRegistry();

registry.register(bend.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "bend" }).value;

test("bend highlights the bend and fold relevance carriers", () => {
  const result = highlight("bend x = 0:\n  fold x = x + 1");

  expect(result).toContain('<span class="hljs-keyword">bend</span>');
  expect(result).toContain('<span class="hljs-keyword">fold</span>');
});

test("bend highlights recursive fields with ~", () => {
  const result = highlight("Node { ~lft, ~rgt }");

  expect(result).toContain('<span class="hljs-meta">~lft</span>');
  expect(result).toContain('<span class="hljs-meta">~rgt</span>');
});

test("bend highlights type names", () => {
  const result = highlight("type Tree:");

  expect(result).toContain('<span class="hljs-keyword">type</span>');
  expect(result).toContain('<span class="hljs-title class_">Tree</span>');
});

test("bend highlights tags", () => {
  const result = highlight("return #done");

  expect(result).toContain('<span class="hljs-symbol">#done</span>');
});

test("bend highlights comments and numbers", () => {
  const result = highlight("# a comment\nx = 24");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain('<span class="hljs-number">24</span>');
});

test("bend closes #{ block comments at #} instead of swallowing the rest of the file", () => {
  const result = highlight("#{ note #}\ndef walk():\n  return 1");

  expect(result).toContain('<span class="hljs-comment">#{ note #}</span>');
  expect(result).toContain('<span class="hljs-keyword">def</span>');
});

test("bend highlights fork in a bend block", () => {
  const result = highlight(
    "bend x = n:\n  when x > 0:\n    fork walk(x - 1)\n  else:\n    x",
  );

  expect(result).toContain('<span class="hljs-keyword">fork</span>');
  expect(result).toContain('<span class="hljs-keyword">bend</span>');
});

test("bend still treats a hash line as a line comment", () => {
  const result = highlight("# a comment\nx = 24");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain('<span class="hljs-number">24</span>');
});
