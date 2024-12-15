import { describe, expect, it } from "bun:test";
import postcss from "postcss";
import { postcssScopedStyles } from "../scripts/utils/postcss-scoped-styles";

describe("postcssScopedStyles", () => {
  const process = (css: string) => {
    return postcss([postcssScopedStyles("moduleName")]).process(css).css;
  };

  it("should scope regular CSS selectors", async () => {
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

  it("should handle pre selectors", async () => {
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

  it("should handle complex selectors", async () => {
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
});
