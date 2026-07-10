import { createRegistry } from "../src/engine.js";

import dhall from "../src/languages/dhall";

const registry = createRegistry();

registry.register(dhall.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "dhall" }).value;

test("dhall highlights let/in keywords", () => {
  const result = highlight("let x = 1 in x");

  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain('<span class="hljs-keyword">in</span>');
});

test("dhall highlights builtin types", () => {
  const result = highlight("let n : Natural = 1");

  expect(result).toContain('<span class="hljs-type">Natural</span>');
});

test("dhall highlights namespaced builtins", () => {
  const result = highlight("Natural/fold 3");

  expect(result).toContain('<span class="hljs-built_in">Natural/fold</span>');
});

test("dhall highlights literals", () => {
  const result = highlight("let b = True");

  expect(result).toContain('<span class="hljs-literal">True</span>');
});

test("dhall highlights lambda syntax operators", () => {
  const asciiResult = highlight("\\(x : Natural) -> x");

  expect(asciiResult).toContain('<span class="hljs-operator">\\</span>');
  expect(asciiResult).toContain('<span class="hljs-operator">-&gt;</span>');

  const unicodeResult = highlight("λ(x : Natural) → x");

  expect(unicodeResult).toContain('<span class="hljs-operator">λ</span>');
  expect(unicodeResult).toContain('<span class="hljs-operator">→</span>');
});
