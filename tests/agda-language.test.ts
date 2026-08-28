import { createRegistry } from "../src/engine.js";

import agda from "../src/languages/agda";

const registry = createRegistry();

registry.register(agda.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "agda" }).value;

test("agda highlights a data declaration with a unicode name", () => {
  const result = highlight("data ℕ : Set where\n  zero : ℕ");

  expect(result).toContain('<span class="hljs-keyword">data</span>');
  expect(result).toContain('<span class="hljs-title class_">ℕ</span>');
});

test("agda highlights unicode operators", () => {
  const result = highlight("suc : ℕ → ℕ");

  expect(result).toContain('<span class="hljs-operator">ℕ</span>');
  expect(result).toContain('<span class="hljs-operator">→</span>');
});

test("agda highlights pragmas", () => {
  const result = highlight("{-# OPTIONS --safe #-}");

  expect(result).toContain(
    '<span class="hljs-meta">{-# OPTIONS --safe #-}</span>',
  );
});

test("agda highlights line comments", () => {
  const result = highlight("-- a comment\nopen import Data.Nat");

  expect(result).toContain('<span class="hljs-comment">-- a comment</span>');
  expect(result).toContain('<span class="hljs-keyword">open</span>');
  expect(result).toContain('<span class="hljs-keyword">import</span>');
});

test("agda highlights nested block comments", () => {
  const result = highlight("{- outer {- inner -} still outer -}");

  expect(result).toBe(
    '<span class="hljs-comment">{- outer <span class="hljs-comment">{- inner -}</span> still outer -}</span>',
  );
});
