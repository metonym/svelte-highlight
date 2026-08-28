import { createRegistry } from "../src/engine.js";

import racket from "../src/languages/racket";

const registry = createRegistry();

registry.register(racket.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "racket" }).value;

test("racket highlights the #lang line", () => {
  const result = highlight("#lang racket");

  expect(result).toContain('<span class="hljs-meta">#lang racket</span>');
});

test("racket highlights identifiers containing a slash", () => {
  const result = highlight("(define/contract (add a b) (+ a b))");

  expect(result).toContain('<span class="hljs-keyword">define/contract</span>');
});

test("racket highlights line and nested block comments", () => {
  const lineResult = highlight(";; a comment\n(define x 1)");
  expect(lineResult).toContain(
    '<span class="hljs-comment">;; a comment</span>',
  );

  const blockResult = highlight("#| outer #| inner |# still outer |#");
  expect(blockResult).toBe(
    '<span class="hljs-comment">#| outer <span class="hljs-comment">#| inner |#</span> still outer |#</span>',
  );
});

test("racket highlights booleans and characters", () => {
  const result = highlight("(if #t #\\a #f)");

  expect(result).toContain('<span class="hljs-literal">#t</span>');
  expect(result).toContain('<span class="hljs-string">#\\a</span>');
  expect(result).toContain('<span class="hljs-literal">#f</span>');
});

test("racket highlights strings and numbers", () => {
  const result = highlight('(displayln (format "~a" 3.14159))');

  expect(result).toContain('<span class="hljs-string">&quot;~a&quot;</span>');
  expect(result).toContain('<span class="hljs-number">3.14159</span>');
});
