import { scopeClassFor, scopeStyle } from "../src/scoped.js";
import a11yDark from "../src/styles/a11y-dark.js";
import brownPaper from "../src/styles/brown-paper.js";

describe("scopeStyle", () => {
  it("scopes a bare .hljs selector beneath the scope class", () => {
    const out = scopeStyle(".hljs{color:red}", "scope");
    expect(out).toBe(".scope .hljs{color:red}");
  });

  it("scopes .hljs-* selectors", () => {
    const out = scopeStyle(".hljs-keyword{color:blue}", "scope");
    expect(out).toBe(".scope .hljs-keyword{color:blue}");
  });

  it("scopes every selector in a comma-separated list", () => {
    const out = scopeStyle(".hljs-comment,\n.hljs-quote{color:gray}", "scope");
    expect(out).toBe(".scope .hljs-comment,\n.scope .hljs-quote{color:gray}");
  });

  it("scopes compound descendant selectors", () => {
    const out = scopeStyle("pre code.hljs{display:block}", "scope");
    expect(out).toBe(".scope pre code.hljs{display:block}");
  });

  it("preserves a <style> wrapper when present", () => {
    const out = scopeStyle("<style>.hljs{color:red}</style>", "scope");
    expect(out).toBe("<style>.scope .hljs{color:red}</style>");
  });

  it("leaves leading license comments in place", () => {
    const out = scopeStyle("/*! License */.hljs{color:red}", "scope");
    expect(out).toBe("/*! License */.scope .hljs{color:red}");
  });

  it("does not split commas inside :not()", () => {
    const out = scopeStyle(".hljs:not(.a, .b){color:red}", "scope");
    expect(out).toBe(".scope .hljs:not(.a, .b){color:red}");
  });

  it("recurses into @media group rules", () => {
    const out = scopeStyle("@media screen{.hljs{color:red}}", "scope");
    expect(out).toBe("@media screen{.scope .hljs{color:red}}");
  });

  it("does not scope @keyframes selectors", () => {
    const css = "@keyframes blink{from{opacity:0}to{opacity:1}}";
    expect(scopeStyle(css, "scope")).toBe(css);
  });

  it("does not break on commas inside url() data URIs", () => {
    const css = ".hljs{background:url(data:image/png;base64,iVBORw0K)}";
    expect(scopeStyle(css, "scope")).toBe(
      ".scope .hljs{background:url(data:image/png;base64,iVBORw0K)}",
    );
  });

  it("scopes a real theme so each selector is prefixed (a11y-dark)", () => {
    const out = scopeStyle(a11yDark, "svh-scope-1");
    // The <style> wrapper survives.
    expect(out.startsWith("<style>")).toBe(true);
    expect(out.endsWith("</style>")).toBe(true);
    // The base .hljs background rule is scoped.
    expect(out).toContain(".svh-scope-1 .hljs{");
    // The nested @media rule's selectors are scoped, the prelude is not.
    expect(out).toContain("@media screen and (-ms-high-contrast: active){");
    expect(out).toContain(".svh-scope-1 .hljs-keyword");
    expect(out).toContain(".svh-scope-1 pre code.hljs{");
    expect(out).toContain(".svh-scope-1 code.hljs{");
    // No rule boundary is immediately followed by an unscoped .hljs selector.
    expect(out).not.toMatch(/[}>]\s*\.hljs/);
  });

  it("does not corrupt a theme that inlines an image data URI (brown-paper)", () => {
    const out = scopeStyle(brownPaper, "svh-scope-2");
    expect(out).toContain(".svh-scope-2 .hljs{");
    expect(out).toContain("url(data:image/png;base64,");
  });
});

describe("scopeClassFor", () => {
  it("is deterministic for the same theme (SSR-safe)", () => {
    expect(scopeClassFor("<style>.hljs{color:red}</style>")).toBe(
      scopeClassFor("<style>.hljs{color:red}</style>"),
    );
  });

  it("differs for different themes", () => {
    expect(scopeClassFor(".hljs{color:red}")).not.toBe(
      scopeClassFor(".hljs{color:blue}"),
    );
  });

  it("uses the default prefix", () => {
    expect(scopeClassFor(".hljs{}")).toMatch(/^svh-scope-[0-9a-z]+$/);
  });

  it("supports a custom prefix", () => {
    expect(scopeClassFor(".hljs{}", "theme")).toMatch(/^theme-[0-9a-z]+$/);
  });
});
