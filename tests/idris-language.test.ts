import { createRegistry } from "../src/engine.js";

import idris from "../src/languages/idris";

const registry = createRegistry();

registry.register(idris.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "idris" }).value;

test("idris highlights the module header", () => {
  const result = highlight("module Main");

  expect(result).toContain('<span class="hljs-keyword">module</span>');
  expect(result).toContain('<span class="hljs-type">Main</span>');
});

test("idris highlights keywords and type constructors", () => {
  const result = highlight("double : Int -> Int\ndouble n = n + n");

  expect(result).toContain('<span class="hljs-type">Int</span>');
});

test("idris highlights do/case/of/total keywords", () => {
  const result = highlight(
    'total\nmain : IO ()\nmain = do\n  case 1 of\n       1 => putStrLn "one"',
  );

  expect(result).toContain('<span class="hljs-keyword">total</span>');
  expect(result).toContain('<span class="hljs-keyword">do</span>');
  expect(result).toContain('<span class="hljs-keyword">case</span>');
  expect(result).toContain('<span class="hljs-keyword">of</span>');
});

test("idris highlights strings and True/False literals", () => {
  const result = highlight('ready : Bool\nready = True\ngreeting = "hi"');

  expect(result).toContain('<span class="hljs-literal">True</span>');
  expect(result).toContain('<span class="hljs-string">&quot;hi&quot;</span>');
});

test("idris highlights nested block comments", () => {
  const result = highlight("{- outer {- inner -} still outer -}");

  expect(result).toBe(
    '<span class="hljs-comment">{- outer <span class="hljs-comment">{- inner -}</span> still outer -}</span>',
  );
});
