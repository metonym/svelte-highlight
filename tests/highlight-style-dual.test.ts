import { dualStyle, scopeStyle } from "../src/scoped.js";

const light = "<style>.hljs{color:black;background:white}</style>";
const dark = "<style>.hljs{color:white;background:black}</style>";

describe("dualStyle", () => {
  it("wraps both themes in prefers-color-scheme media queries for auto", () => {
    const out = dualStyle(light, dark, "scope", "auto");
    expect(out).toBe(
      "<style>" +
        "@media (prefers-color-scheme: light){.scope .hljs{color:black;background:white}}" +
        "@media (prefers-color-scheme: dark){.scope .hljs{color:white;background:black}}" +
        "</style>",
    );
  });

  it("defaults to auto when no mode is given", () => {
    expect(dualStyle(light, dark, "scope")).toBe(
      dualStyle(light, dark, "scope", "auto"),
    );
  });

  it("contains both scoped themes in auto mode", () => {
    const out = dualStyle(light, dark, "scope", "auto");
    expect(out).toContain(".scope .hljs{color:black;background:white}");
    expect(out).toContain(".scope .hljs{color:white;background:black}");
  });

  it("emits only the light theme for mode=light", () => {
    const out = dualStyle(light, dark, "scope", "light");
    expect(out).toBe(
      "<style>.scope .hljs{color:black;background:white}</style>",
    );
    expect(out).not.toContain("color:white");
    expect(out).not.toContain("prefers-color-scheme");
  });

  it("emits only the dark theme for mode=dark", () => {
    const out = dualStyle(light, dark, "scope", "dark");
    expect(out).toBe(
      "<style>.scope .hljs{color:white;background:black}</style>",
    );
    expect(out).not.toContain("color:black");
    expect(out).not.toContain("prefers-color-scheme");
  });

  it("treats any other mode string as a selector gating the dark block", () => {
    const out = dualStyle(light, dark, "scope", '[data-theme="dark"]');
    expect(out).toBe(
      "<style>" +
        ".scope .hljs{color:black;background:white}" +
        '[data-theme="dark"] .scope .hljs{color:white;background:black}' +
        "</style>",
    );
  });

  it("scopes every selector of a multi-rule theme", () => {
    const multi =
      "<style>.hljs{color:black}.hljs-keyword,\n.hljs-type{color:red}</style>";
    const out = dualStyle(multi, multi, "scope", "light");
    expect(out).toBe(
      "<style>.scope .hljs{color:black}.scope .hljs-keyword,\n.scope .hljs-type{color:red}</style>",
    );
  });

  it("handles themes without a <style> wrapper", () => {
    const out = dualStyle(
      ".hljs{color:black}",
      ".hljs{color:white}",
      "scope",
      "auto",
    );
    expect(out).toBe(
      "<style>" +
        "@media (prefers-color-scheme: light){.scope .hljs{color:black}}" +
        "@media (prefers-color-scheme: dark){.scope .hljs{color:white}}" +
        "</style>",
    );
  });
});

describe("single-theme HighlightStyle output is unchanged", () => {
  it("scopeStyle still preserves a <style> wrapper and scopes selectors", () => {
    expect(scopeStyle(light, "scope")).toBe(
      "<style>.scope .hljs{color:black;background:white}</style>",
    );
  });
});
