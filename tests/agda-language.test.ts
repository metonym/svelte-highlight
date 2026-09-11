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

test("agda highlights opaque/unfolding, coinductive, and interleaved mutual", () => {
  const result = highlight(
    "opaque\n  unfolding plus\n  secret : Nat\nrecord Stream (A : Set) : Set where\n  coinductive\n  field hd : A\ninterleaved mutual\n  even : Nat → Bool",
  );

  expect(result).toContain('<span class="hljs-keyword">opaque</span>');
  expect(result).toContain('<span class="hljs-keyword">unfolding</span>');
  expect(result).toContain('<span class="hljs-keyword">coinductive</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">interleaved</span> <span class="hljs-keyword">mutual</span>',
  );
  expect(result).toContain('<span class="hljs-built_in">Set</span>');
});

test("agda highlights hex and exponent numbers", () => {
  const result = highlight("x = 0x2A + 3.5e2 + 7");

  expect(result).toContain('<span class="hljs-number">0x2A</span>');
  expect(result).toContain('<span class="hljs-number">3.5e2</span>');
  expect(result).toContain('<span class="hljs-number">7</span>');
});

test("agda highlights char literals but not primes in identifiers", () => {
  const result = highlight("c = 'a'\nf x' y' = x'");

  expect(result).toContain('<span class="hljs-string">&#x27;a&#x27;</span>');
  expect(result).toContain("f x&#x27; y&#x27; = x&#x27;");
});
