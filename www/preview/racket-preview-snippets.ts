export type RacketPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const racketPreviewSnippets: RacketPreviewSnippet[] = [
  {
    title: "A contracted function",
    description: "#lang line, define/contract, and a format string",
    code: `#lang racket
;; sum of two numbers with a contract
(define/contract (add a b)
  (-> integer? integer? integer?)
  (+ a b))

(define pi 3.14159)
(displayln (format "~a" (add 1 2)))`,
  },
  {
    title: "Structs and pattern matching",
    description: "struct, match, and square-bracket binding forms",
    code: `(struct point (x y) #:transparent)

(define (describe p)
  (match p
    [(point 0 0) "origin"]
    [(point x y) (format "(~a, ~a)" x y)]))

(for/list ([p (list (point 0 0) (point 1 2))])
  (describe p))`,
  },
  {
    title: "Nested block comments",
    description: "a comment wrapping an example that has its own comment",
    code: `#| adds two numbers
   #| example: (add 1 2) => 3 |#
|#
(define (add a b)
  (+ a b))`,
  },
];
