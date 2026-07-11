import { createRegistry } from "../src/engine.js";

import clarity from "../src/languages/clarity";

const registry = createRegistry();

registry.register(clarity.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "clarity" }).value;

test("clarity highlights hyphenated define keywords", () => {
  const result = highlight("(define-public (go) (ok true))");

  expect(result).toContain('<span class="hljs-keyword">define-public</span>');
  expect(result).toContain('<span class="hljs-keyword">ok</span>');
});

test("clarity highlights keywords ending in punctuation", () => {
  const result = highlight("(asserts! true (err u1))");

  expect(result).toContain('<span class="hljs-keyword">asserts!</span>');
});

test("clarity highlights types and literals", () => {
  const result = highlight("(define-data-var n uint u0)");

  expect(result).toContain('<span class="hljs-type">uint</span>');
});

test("clarity highlights uint literals and comments", () => {
  const result = highlight(";; counter\n(var-set n u5)");

  expect(result).toContain('<span class="hljs-comment">;; counter</span>');
  expect(result).toContain('<span class="hljs-number">u5</span>');
});

test("clarity highlights common built-ins used in auth checks and chain-state reads", () => {
  const result = highlight(
    "(asserts! (is-eq tx-sender contract-caller) (err u1))\n(default-to u0 (map-get? balances tx-sender))\nblock-height\nburn-block-height\n(stx-liquid-supply)",
  );

  expect(result).toContain('<span class="hljs-built_in">tx-sender</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">contract-caller</span>',
  );
  expect(result).toContain('<span class="hljs-built_in">default-to</span>');
  expect(result).toContain('<span class="hljs-built_in">block-height</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">burn-block-height</span>',
  );
  expect(result).toContain(
    '<span class="hljs-built_in">stx-liquid-supply</span>',
  );
});
