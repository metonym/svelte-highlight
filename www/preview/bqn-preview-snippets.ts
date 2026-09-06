export type BqnPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const bqnPreviewSnippets: BqnPreviewSnippet[] = [
  {
    title: "Double and sum",
    description: "the define arrow, a system value, and primitive glyphs",
    code: `# double each number and sum
Double ⇐ ×2
Sum ← +´
Total ← Sum Double¨ ⟨1‿2‿3‿4⟩
•Show Total`,
  },
  {
    title: "Blocks and roles",
    description: "block variables and a two-modifier",
    code: `Add ← {𝕨+𝕩}
Mod2 ← _fold_ {𝔽 𝕩}
3 Add 4`,
  },
  {
    title: "System functions",
    description: "•Type and •Repr",
    code: `•Show •Type 5
•Show •Repr "hello"`,
  },
];
