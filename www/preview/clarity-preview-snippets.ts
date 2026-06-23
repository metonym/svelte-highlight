export type ClarityPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const clarityPreviewSnippets: ClarityPreviewSnippet[] = [
  {
    title: "Counter contract",
    description: "define forms, data vars, and responses",
    code: `;; A simple counter
(define-data-var counter uint u0)

(define-read-only (get-counter)
  (var-get counter))

(define-public (increment (step uint))
  (begin
    (asserts! (> step u0) (err u100))
    (var-set counter (+ (var-get counter) step))
    (ok (var-get counter))))`,
  },
  {
    title: "Token transfer",
    description: "maps, principals, and assertions",
    code: `(define-map balances principal uint)

(define-public (transfer (amount uint) (recipient principal))
  (let ((sender-balance (default-to u0 (map-get? balances tx-sender))))
    (asserts! (>= sender-balance amount) (err u1))
    (map-set balances tx-sender (- sender-balance amount))
    (ok true)))`,
  },
];
