export type AgdaPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const agdaPreviewSnippets: AgdaPreviewSnippet[] = [
  {
    title: "Naturals and a simple proof",
    description: "a unicode data declaration and a recursive function",
    code: `{-# OPTIONS --safe #-}
data ℕ : Set where
  zero : ℕ
  suc  : ℕ → ℕ

double : ℕ → ℕ
double zero = zero
double (suc n) = suc (suc (double n))`,
  },
  {
    title: "Records and modules",
    description: "a record type and a module namespace",
    code: `record Point : Set where
  field
    x : ℕ
    y : ℕ

module Origin where
  origin : Point
  origin = record { x = zero ; y = zero }`,
  },
  {
    title: "Nested comments",
    description: "a comment wrapping an example that has its own comment",
    code: `{- doubles a natural number
   {- example: double 21 ≡ 42 -}
-}
double : ℕ → ℕ
double zero = zero
double (suc n) = suc (suc (double n))`,
  },
];
