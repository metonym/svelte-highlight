import { createRegistry } from "../src/engine.js";

import unison from "../src/languages/unison";

const registry = createRegistry();

registry.register(unison.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "unison" }).value;

test("unison highlights ability and structural as relevance carriers", () => {
  const result = highlight("structural ability Stream where");

  expect(result).toContain('<span class="hljs-keyword">structural</span>');
  expect(result).toContain('<span class="hljs-keyword">ability</span>');
});

test("unison highlights line and block comments", () => {
  const result = highlight("-- a comment\n{- block -}");

  expect(result).toContain('<span class="hljs-comment">-- a comment</span>');
  expect(result).toContain('<span class="hljs-comment">{- block -}</span>');
});

test("unison highlights the test> marker", () => {
  const result = highlight("test> double.tests.ex1 =");

  expect(result).toContain('<span class="hljs-meta">test&gt;</span>');
});

test("unison highlights ability sets as types", () => {
  const result = highlight("main : '{IO, Exception} ()");

  expect(result).toContain('<span class="hljs-type">{IO, Exception}</span>');
});

test("unison highlights numbers and strings", () => {
  const result = highlight('x = +1\ns = "hello"');

  expect(result).toContain('<span class="hljs-number">+1</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;hello&quot;</span>',
  );
});
