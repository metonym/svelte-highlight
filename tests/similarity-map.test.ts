import { buildGapFillProposals } from "../scripts/utils/similarity-map";

describe("buildGapFillProposals", () => {
  it("proposes a donor color for a scope a theme never styles", () => {
    // Across the corpus, `.hljs-attr` and `.hljs-number` are always grouped
    // together, so a theme missing `.hljs-attr` entirely should borrow
    // `.hljs-number`'s color from within its own palette.
    const rawCssByTheme = new Map([
      ["a", ".hljs-attr, .hljs-number { color: red }"],
      ["b", ".hljs-attr, .hljs-number { color: blue }"],
      ["c", ".hljs-number { color: green }"], // missing .hljs-attr
    ]);

    const proposals = buildGapFillProposals(rawCssByTheme);
    expect(proposals.get("c")?.get(".hljs-attr")).toBe("green");
  });

  it("does not propose a donor with no corpus-wide agreement", () => {
    const rawCssByTheme = new Map([
      ["a", ".hljs-attr { color: red } .hljs-number { color: blue }"],
      ["b", ".hljs-attr { color: green } .hljs-number { color: yellow }"],
      ["c", ".hljs-number { color: purple }"], // missing .hljs-attr
    ]);

    const proposals = buildGapFillProposals(rawCssByTheme);
    expect(proposals.get("c")?.has(".hljs-attr")).toBe(false);
  });

  it("does not propose a fill for a theme that already styles the scope", () => {
    const rawCssByTheme = new Map([
      ["a", ".hljs-attr, .hljs-number { color: red }"],
      ["b", ".hljs-attr, .hljs-number { color: blue }"],
      ["c", ".hljs-attr, .hljs-number { color: green }"],
    ]);

    const proposals = buildGapFillProposals(rawCssByTheme);
    expect(proposals.get("c")?.has(".hljs-attr")).toBe(false);
  });

  it("ignores grouping signal from rules with no color declared", () => {
    // `.hljs-formula, .hljs-params {}` (empty body) shows up in every theme,
    // but never actually colors anything — it shouldn't count as evidence
    // that the two scopes share a color.
    const rawCssByTheme = new Map([
      ["a", ".hljs-formula, .hljs-params {} .hljs-params { color: red }"],
      ["b", ".hljs-formula, .hljs-params {} .hljs-params { color: blue }"],
      ["c", ".hljs-params { color: green }"], // missing .hljs-formula
    ]);

    const proposals = buildGapFillProposals(rawCssByTheme);
    expect(proposals.get("c")?.has(".hljs-formula")).toBe(false);
  });
});
