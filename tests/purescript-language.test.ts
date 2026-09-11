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

test("purescript highlights strings and true/false literals", () => {
  const result = highlight('ready = true\ngreeting = "hi"');

  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-string">&quot;hi&quot;</span>');
});

test("purescript highlights nested block comments", () => {
  const result = highlight("{- outer {- inner -} still outer -}");

  expect(result).toBe(
    '<span class="hljs-comment">{- outer <span class="hljs-comment">{- inner -}</span> still outer -}</span>',
  );
});

test("purescript highlights derive, ado, hiding, and as as keywords", () => {
  const result = highlight(
    "import Prelude hiding (map)\nimport Data.Map as M\nderive newtype instance eqM :: Eq M\nf = ado\n  a <- pure 1\n  in a",
  );

  expect(result).toContain('<span class="hljs-keyword">hiding</span>');
  expect(result).toContain('<span class="hljs-keyword">as</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">derive</span> <span class="hljs-keyword">newtype</span> <span class="hljs-keyword">instance</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">ado</span>');
});

test("purescript styles then as a keyword, not a built-in", () => {
  const result = highlight("x = if b then 1 else 2");

  expect(result).toContain(
    '<span class="hljs-keyword">if</span> b <span class="hljs-keyword">then</span> <span class="hljs-number">1</span> <span class="hljs-keyword">else</span>',
  );
  expect(result).not.toContain('<span class="hljs-built_in">then</span>');
});

test("purescript highlights hex and underscore-separated numbers", () => {
  const result = highlight("n = 0xFF + 1_000_000 + 2.5e3 + 7");

  expect(result).toContain('<span class="hljs-number">0xFF</span>');
  expect(result).toContain('<span class="hljs-number">1_000_000</span>');
  expect(result).toContain('<span class="hljs-number">2.5e3</span>');
  expect(result).toContain('<span class="hljs-number">7</span>');
});

test("purescript styles capitalized True as a type constructor, not a literal", () => {
  const result = highlight("data B = True | False");

  expect(result).toContain('<span class="hljs-type">True</span>');
  expect(result).not.toContain("hljs-literal");
});
