export type UiuaPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const uiuaPreviewSnippets: UiuaPreviewSnippet[] = [
  {
    title: "Double and sum",
    description: "a binding arrow, stack glyphs, and a format string",
    code: `# double each number and sum
Double ← ×2
Total ← /+ ≡Double [1 2 3 4]
&p $"Total: _" Total`,
  },
  {
    title: "ASCII-spelled primitives",
    description: "dup, flip, and over as words instead of glyphs",
    code: `Square ← dup×
Swap ← flip
Third ← pop pop`,
  },
  {
    title: "Constants",
    description: "the built-in π and ∞ constants",
    code: `Circumference ← ×2×π
IsInfinite ← =∞`,
  },
];
