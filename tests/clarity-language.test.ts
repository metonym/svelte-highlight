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

test("clarity styles contract references without treating digit segments as numbers", () => {
  const result = highlight(
    "(use-trait ft-trait .sip-010-trait.sip-010-trait)\n(contract-call? .other-contract do-thing u1)\n(define-constant ERR-404 (err u404))",
  );

  expect(result).toContain(
    '<span class="hljs-symbol">.sip-010-trait.sip-010-trait</span>',
  );
  expect(result).toContain('<span class="hljs-symbol">.other-contract</span>');
  expect(result).not.toContain('<span class="hljs-number">010</span>');
  expect(result).toContain("ERR-404 (");
  expect(result).not.toContain('<span class="hljs-number">404</span> ');
  expect(result).toContain('<span class="hljs-number">u404</span>');
});

test("clarity highlights principal literals with contract and trait segments", () => {
  const result = highlight(
    "(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)\n(stx-transfer? u50 tx-sender 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)",
  );

  expect(result).toContain(
    '<span class="hljs-symbol">&#x27;SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait</span>',
  );
  expect(result).toContain(
    '<span class="hljs-symbol">&#x27;ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM</span>)',
  );
});

test("clarity highlights utf8 strings including the u prefix", () => {
  const result = highlight('(print { msg: u"h\\u{e9}llo", ascii: "plain" })');

  expect(result).toContain(
    '<span class="hljs-string">u&quot;h\\u{e9}llo&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">&quot;plain&quot;</span>',
  );
});

test("clarity highlights Clarity 2 and 3 builtins", () => {
  const result = highlight(
    '(asserts! (> stacks-block-height u0) (err u1))\n(get-stacks-block-info? time u1)\n(ok (to-consensus-buff? (bit-shift-left u1 u2)))\n(slice? "hello" u0 u2)\n(principal-destruct? tx-sender)\n(print tenure-height)',
  );

  expect(result).toContain(
    '<span class="hljs-built_in">stacks-block-height</span>',
  );
  expect(result).toContain(
    '<span class="hljs-built_in">get-stacks-block-info?</span>',
  );
  expect(result).toContain(
    '<span class="hljs-built_in">to-consensus-buff?</span>',
  );
  expect(result).toContain('<span class="hljs-built_in">bit-shift-left</span>');
  expect(result).toContain('<span class="hljs-built_in">slice?</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">principal-destruct?</span>',
  );
  expect(result).toContain('<span class="hljs-built_in">tenure-height</span>');
});
