import {
  highlightRules,
  highlightRulesFromPalette,
} from "../src/highlight-theme.js";
import github from "../src/styles/github.js";
import githubPalette from "../src/themes/github.js";

describe("highlightRules", () => {
  it("converts a simple .hljs-<scope> color rule", () => {
    const out = highlightRules(".hljs-keyword{color:#c678dd}");
    expect(out).toBe("::highlight(hljs-keyword){color:#c678dd}");
  });

  it("keeps color and background-color, drops other declarations", () => {
    const out = highlightRules(
      ".hljs-addition{color:green;background-color:#f0fff4;font-weight:bold}",
    );
    expect(out).toBe(
      "::highlight(hljs-addition){color:green;background-color:#f0fff4}",
    );
  });

  it("drops font-style-only rules entirely", () => {
    expect(highlightRules(".hljs-emphasis{font-style:italic}")).toBe("");
  });

  it("expands a grouped selector list, dropping compound/descendant members", () => {
    const out = highlightRules(
      ".hljs-doctag,\n.hljs-keyword,\n.hljs-meta .hljs-keyword,\n.hljs-variable.language_{color:#d73a49}",
    );
    expect(out).toBe(
      "::highlight(hljs-doctag){color:#d73a49}" +
        "::highlight(hljs-keyword){color:#d73a49}",
    );
  });

  it("drops the base .hljs rule (not a scope selector)", () => {
    expect(highlightRules(".hljs{color:#24292e;background:#ffffff}")).toBe("");
  });

  it("ignores @media-wrapped rules", () => {
    const out = highlightRules(
      "@media (prefers-color-scheme: dark){.hljs-keyword{color:red}}",
    );
    expect(out).toBe("");
  });

  it("converts the github theme with a known rule and drops font-style", () => {
    const out = highlightRules(github);

    expect(out).toContain("::highlight(hljs-keyword){color:#d73a49}");
    expect(out).not.toContain("font-style");
    expect(out).not.toContain("font-weight");
  });
});

describe("highlightRulesFromPalette", () => {
  it("converts a single-scope color var", () => {
    const out = highlightRulesFromPalette({
      name: "test",
      colorScheme: "dark",
      vars: { "--shl-keyword": "#c678dd" },
    });
    expect(out).toBe("::highlight(hljs-keyword){color:#c678dd}");
  });

  it("merges color and background-color vars for the same scope", () => {
    const out = highlightRulesFromPalette({
      name: "test",
      colorScheme: "dark",
      vars: {
        "--shl-addition": "green",
        "--shl-addition-bg": "#f0fff4",
      },
    });
    expect(out).toBe(
      "::highlight(hljs-addition){color:green;background-color:#f0fff4}",
    );
  });

  it("drops font-style/font-weight/text-decoration-only vars entirely", () => {
    const out = highlightRulesFromPalette({
      name: "test",
      colorScheme: "dark",
      vars: {
        "--shl-emphasis-font-style": "italic",
        "--shl-strong-font-weight": "bold",
        "--shl-link-text-decoration": "underline",
      },
    });
    expect(out).toBe("");
  });

  it("drops multi-scope (compound/descendant) vars", () => {
    const out = highlightRulesFromPalette({
      name: "test",
      colorScheme: "dark",
      vars: {
        "--shl-doctag": "#d73a49",
        "--shl-keyword": "#d73a49",
        "--shl-meta-keyword": "#d73a49",
        "--shl-variable-language_": "#d73a49",
      },
    });
    expect(out).toBe(
      "::highlight(hljs-doctag){color:#d73a49}" +
        "::highlight(hljs-keyword){color:#d73a49}",
    );
  });

  it("drops the base fg/bg vars (not a scope)", () => {
    const out = highlightRulesFromPalette({
      name: "test",
      colorScheme: "light",
      vars: { "--shl-fg": "#24292e", "--shl-bg": "#ffffff" },
    });
    expect(out).toBe("");
  });

  it("converts the github palette with a known rule and drops font-style", () => {
    const out = highlightRulesFromPalette(githubPalette);

    expect(out).toContain("::highlight(hljs-keyword){color:#d73a49}");
    expect(out).not.toContain("font-style");
    expect(out).not.toContain("font-weight");
  });
});
