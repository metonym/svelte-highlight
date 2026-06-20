import { scopeStylesheet } from "../scripts/utils/scope-stylesheet";

describe("scopeStylesheet", () => {
  const process = (css: string) => scopeStylesheet(css, "moduleName");

  it("should scope regular CSS selectors", () => {
    const input = `
      p { color: red; }
      div { background: blue; }
    `;
    const expected = `
      .moduleName p { color: red; }
      .moduleName div { background: blue; }
    `;
    expect(process(input)).toBe(expected);
  });

  it("should handle pre selectors", () => {
    const input = `
      pre .className { color: red; }
      pre.someClass { background: blue; }
      pre { padding: 1em; }
    `;
    const expected = `
      pre.moduleName .className { color: red; }
      .moduleName pre.someClass { background: blue; }
      .moduleName pre { padding: 1em; }
    `;
    expect(process(input)).toBe(expected);
  });

  it("should handle complex selectors", () => {
    const input = `
      div > p { color: red; }
      .class1 .class2 { background: blue; }
      #id1 span { padding: 1em; }
    `;
    const expected = `
      .moduleName div > p { color: red; }
      .moduleName .class1 .class2 { background: blue; }
      .moduleName #id1 span { padding: 1em; }
    `;
    expect(process(input)).toBe(expected);
  });

  it("should scope every selector in a comma-separated list", () => {
    expect(process(".hljs-comment,.hljs-quote{color:gray}")).toBe(
      ".moduleName .hljs-comment,.moduleName .hljs-quote{color:gray}",
    );
  });

  it("should scope nested rules inside @media", () => {
    expect(process("@media screen{.hljs{color:red}}")).toBe(
      "@media screen{.moduleName .hljs{color:red}}",
    );
  });
});
