import postcss from "postcss";
import { removeDeadDeclarations } from "../scripts/utils/remove-dead-declarations";

const process = (css: string) =>
  postcss([removeDeadDeclarations()]).process(css).css;

describe("removeDeadDeclarations", () => {
  it("drops a selector from an earlier group when its property is overridden later", () => {
    const input = `
      .hljs-addition, .hljs-number, .hljs-link { color: #C5FE00 }
      .hljs-attribute, .hljs-addition { color: #E7FF9F }
    `;
    const output = process(input);
    expect(output).not.toContain(".hljs-addition, .hljs-number");
    expect(output).toContain(".hljs-number, .hljs-link { color: #C5FE00 }");
    expect(output).toContain(
      ".hljs-attribute, .hljs-addition { color: #E7FF9F }",
    );
  });

  it("removes a standalone rule entirely once it's fully overridden", () => {
    const input = `
      .hljs-subst { font-weight: bold }
      .hljs-subst { font-weight: normal }
    `;
    const output = process(input);
    expect(output.trim()).toBe(".hljs-subst { font-weight: normal }");
  });

  it("leaves a selector alone when only some of its properties are overridden", () => {
    const input = `
      .hljs-x, .hljs-y { color: red; font-weight: bold }
      .hljs-x { color: blue }
    `;
    const output = process(input);
    expect(output).toContain(
      ".hljs-x, .hljs-y { color: red; font-weight: bold }",
    );
    expect(output).toContain(".hljs-x { color: blue }");
  });

  it("does not treat a conditional @media override as replacing an unconditional rule", () => {
    const input = `
      .hljs-comment { color: #d4d0ab }
      @media screen and (-ms-high-contrast: active) {
        .hljs-comment { color: highlight }
      }
    `;
    const output = process(input);
    expect(output).toContain(".hljs-comment { color: #d4d0ab }");
    expect(output).toContain("color: highlight");
  });

  it("leaves compound selectors untouched", () => {
    const input = `
      .hljs-title.class_ { color: red }
      .hljs-title.class_ { color: blue }
    `;
    const output = process(input);
    expect(output).toContain(".hljs-title.class_ { color: red }");
    expect(output).toContain(".hljs-title.class_ { color: blue }");
  });

  it("is a no-op for CSS with no overrides", () => {
    const input = ".hljs-comment { color: gray }";
    expect(process(input)).toBe(input);
  });
});
