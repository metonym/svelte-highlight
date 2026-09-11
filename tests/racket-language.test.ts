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

test("racket highlights definition, binding, and class forms", () => {
  const result = highlight(
    "(define-values (q r) (quotient/remainder 17 5))\n(define-syntax-rule (swap! a b) (void))\n(case-lambda [() 1])\n(cond [else (λ (x) x)])\n(let-values ([(a b) (values 1 2)]) a)\n(for*/list ([x xs]) x)\n(match-define (list a) '(1))\n(class object% (super-new) (init-field n))",
  );

  for (const keyword of [
    "define-values",
    "define-syntax-rule",
    "case-lambda",
    "else",
    "λ",
    "let-values",
    "for*/list",
    "match-define",
    "super-new",
    "init-field",
  ]) {
    expect(result).toContain(`<span class="hljs-keyword">${keyword}</span>`);
  }
});

test("racket highlights infinities and complex numbers", () => {
  const result = highlight(
    "(list +inf.0 -nan.0 3+4i 1.5-2i (+ acc x) (- 1 2))",
  );

  expect(result).toContain('<span class="hljs-number">+inf.0</span>');
  expect(result).toContain('<span class="hljs-number">-nan.0</span>');
  expect(result).toContain('<span class="hljs-number">3+4i</span>');
  expect(result).toContain('<span class="hljs-number">1.5-2i</span>');
  expect(result).toContain("(+ acc x)");
  expect(result).toContain(
    '(- <span class="hljs-number">1</span> <span class="hljs-number">2</span>)',
  );
});

test("racket highlights keyword arguments and quoted symbols", () => {
  const result = highlight(
    "(struct p (x) #:transparent)\n(for/list ([x xs] #:when (even? x)) x)\n(error 'area \"bad\")\n'(1 2)",
  );

  expect(result).toContain('<span class="hljs-symbol">#:transparent</span>');
  expect(result).toContain('<span class="hljs-symbol">#:when</span>');
  expect(result).toContain('<span class="hljs-symbol">&#x27;area</span>');
  expect(result).toContain(
    '&#x27;(<span class="hljs-number">1</span> <span class="hljs-number">2</span>)',
  );
});

test("racket includes the prefix of byte and regexp strings in the string", () => {
  const result = highlight('(regexp-match #rx"^a+$" #px#"\\\\d+" #"bytes")');

  expect(result).toContain(
    '<span class="hljs-string">#rx&quot;^a+$&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">#px#&quot;\\\\d+&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">#&quot;bytes&quot;</span>',
  );
});
