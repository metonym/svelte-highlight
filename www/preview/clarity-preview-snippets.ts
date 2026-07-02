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
  {
    title: "Access control and expiry",
    description: "contract-caller, block-height, and burn-block-height",
    code: `(define-constant owner tx-sender)
(define-data-var expires-at uint u0)

(define-public (set-expiry (blocks uint))
  (begin
    (asserts! (is-eq contract-caller owner) (err u403))
    (var-set expires-at (+ block-height blocks))
    (ok (var-get expires-at))))

(define-read-only (is-expired)
  (> burn-block-height (var-get expires-at)))`,
  },
];
