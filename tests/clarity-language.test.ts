import hljs from "highlight.js/lib/core";
import clarity from "../src/languages/clarity";

hljs.registerLanguage(clarity.name, clarity.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "clarity" }).value;

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
