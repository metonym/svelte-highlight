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
