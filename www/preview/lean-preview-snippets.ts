export type LeanPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const leanPreviewSnippets: LeanPreviewSnippet[] = [
  {
    title: "A theorem with unicode operators",
    description: "∀, →, and ℕ in a type signature and proof",
    code: `def succ (n : ℕ) : ℕ := n + 1

theorem succ_pos : ∀ n : ℕ, succ n > 0 := by
  intro n
  simp [succ]`,
  },
  {
    title: "Structures and namespaces",
    description: "structure, namespace, and a def inside it",
    code: `structure Point where
  x : ℤ
  y : ℤ

namespace Point

def origin : Point := { x := 0, y := 0 }

end Point`,
  },
  {
    title: "Nested doc comments",
    description: "a doc comment wrapping an example that has its own comment",
    code: `/- computes the successor of a natural number
   /- example: succ 41 = 42 -/
-/
def succ (n : ℕ) : ℕ := n + 1`,
  },
];
