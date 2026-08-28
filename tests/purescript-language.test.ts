import { createRegistry } from "../src/engine.js";

import purescript from "../src/languages/purescript";

const registry = createRegistry();

registry.register(purescript.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "purescript" }).value;

test("purescript highlights the module header", () => {
  const result = highlight("module Main where");

  expect(result).toContain('<span class="hljs-title class_">Main</span>');
});

test("purescript highlights keywords and type constructors", () => {
  const result = highlight("double :: Int -> Int\ndouble n = n + n");

  expect(result).toContain('<span class="hljs-type">Int</span>');
});

test("purescript highlights do/case/of keywords", () => {
  const result = highlight(
    'main = do\n  case double 21 of\n    42 -> "yes"\n    _  -> "no"',
  );

  expect(result).toContain('<span class="hljs-keyword">do</span>');
  expect(result).toContain('<span class="hljs-keyword">case</span>');
  expect(result).toContain('<span class="hljs-keyword">of</span>');
});

test("purescript highlights strings and True/False literals", () => {
  const result = highlight('ready = True\ngreeting = "hi"');

  expect(result).toContain('<span class="hljs-literal">True</span>');
  expect(result).toContain('<span class="hljs-string">&quot;hi&quot;</span>');
});

test("purescript highlights nested block comments", () => {
  const result = highlight("{- outer {- inner -} still outer -}");

  expect(result).toBe(
    '<span class="hljs-comment">{- outer <span class="hljs-comment">{- inner -}</span> still outer -}</span>',
  );
});
