import { createRegistry } from "../src/engine.js";

import tsq from "../src/languages/tsq";

const registry = createRegistry();

registry.register(tsq.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "tsq" }).value;

test("tsq highlights node names inside parens", () => {
  const result = highlight("(function_item)");

  expect(result).toContain(
    '<span class="hljs-title class_">function_item</span>',
  );
});

test("tsq highlights field names", () => {
  const result = highlight("name: (identifier)");

  expect(result).toContain('<span class="hljs-attr">name</span>');
});

test("tsq highlights captures", () => {
  const result = highlight("(identifier) @function.name");

  expect(result).toContain('<span class="hljs-variable">@function.name</span>');
});

test("tsq highlights predicates", () => {
  const result = highlight('(#match? @constant "^[A-Z_]+$")');

  expect(result).toContain('<span class="hljs-built_in">#match?</span>');
});

test("tsq highlights comments, ERROR, and the wildcard", () => {
  const result = highlight("; a comment\n(ERROR) @error\n_ @any");

  expect(result).toContain('<span class="hljs-comment">; a comment</span>');
  expect(result).toContain('<span class="hljs-literal">ERROR</span>');
  expect(result).toContain('<span class="hljs-literal">_</span>');
});

test("tsq treats a parenthesized wildcard as the wildcard, not a node name", () => {
  const result = highlight("(array (_) @item)\n(_x) @named");

  expect(result).toContain('(<span class="hljs-literal">_</span>)');
  expect(result).not.toContain('<span class="hljs-title class_">_</span>');
  expect(result).toContain('(<span class="hljs-title class_">_x</span>)');
});

test("tsq keeps the anchor operator out of dotted directive arguments", () => {
  const result = highlight(
    '((comment) @c (#set! injection.language "html"))\n(pair . (string) @first)\n(array (_) @last .)',
  );

  expect(result).toContain("injection.language");
  expect(result).not.toContain('injection<span class="hljs-operator">.</span>');
  expect(result).toContain(
    '<span class="hljs-title class_">pair</span> <span class="hljs-operator">.</span> (',
  );
  expect(result).toContain(
    '<span class="hljs-variable">@last</span> <span class="hljs-operator">.</span>)',
  );
});

test("tsq highlights supertype node names and integer directive arguments", () => {
  const result = highlight(
    "(expression/identifier) @expr\n(#offset! @node 0 1 0 -1)\n(call_expression) @c",
  );

  expect(result).toContain(
    '(<span class="hljs-title class_">expression/identifier</span>)',
  );
  expect(result).toContain(
    '<span class="hljs-variable">@node</span> <span class="hljs-number">0</span> <span class="hljs-number">1</span> <span class="hljs-number">0</span> <span class="hljs-number">-1</span>',
  );
  expect(result).toContain(
    '<span class="hljs-title class_">call_expression</span>',
  );
});
