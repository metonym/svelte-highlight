import { describe, expect, test } from "bun:test";
import postcss from "postcss";
import { postcssInlineCssVars } from "../scripts/utils/postcss-inline-css-vars";

describe("postcssInlineCssVars", () => {
  const process = (css: string) => {
    return postcss([postcssInlineCssVars()]).process(css).css;
  };

  test("removes :root rule after processing", () => {
    const source = `
      :root {
        --primary-color: #ff0000;
      }
      h1 { color: red; }
    `;
    const result = process(source);

    expect(result).not.toContain(":root");
    expect(result).toContain("h1 { color: red; }");
  });

  test("replaces CSS variable with its value", () => {
    const source = `
      :root {
        --primary-color: #ff0000;
      }
      h1 { color: var(--primary-color); }
    `;
    const result = process(source);

    expect(result).not.toContain("var(--primary-color)");
    expect(result).toContain("color: #ff0000");
  });

  test("handles multiple CSS variables", () => {
    const source = `
      :root {
        --primary-color: #ff0000;
        --secondary-color: #00ff00;
      }
      h1 { color: var(--primary-color); }
      p { color: var(--secondary-color); }
    `;
    const result = process(source);

    expect(result).toContain("color: #ff0000");
    expect(result).toContain("color: #00ff00");
  });

  test("preserves original value if variable is not defined", () => {
    const source = `
      :root {
        --primary-color: #ff0000;
      }
      h1 { color: var(--undefined-color); }
    `;
    const result = process(source);

    expect(result).toContain("color: var(--undefined-color)");
  });

  test("handles nested CSS variables", () => {
    const source = `
      :root {
        --primary: #ff0000;
        --button-color: var(--primary);
      }
      button { color: var(--button-color); }
    `;
    const result = process(source);

    expect(result).not.toContain(":root");
    expect(result).toContain("color: #ff0000");
  });

  test("handles multiple var() references in single declaration", () => {
    const source = `
      :root {
        --spacing-x: 10px;
        --spacing-y: 20px;
      }
      .box { margin: var(--spacing-y) var(--spacing-x); }
    `;
    const result = process(source);

    expect(result).toContain("margin: 20px 10px");
  });

  test("skips processing when no root vars present", () => {
    const source = `
      .button { 
        color: blue;
        padding: 10px;
      }
      .header {
        font-size: 16px;
      }
    `;
    const result = postcss([postcssInlineCssVars()]).process(source).css;

    // Should be identical to source since no processing needed
    expect(result.trim()).toBe(source.trim());
  });

  test("ignores :root when part of a larger selector", () => {
    const source = `
      :root.dark {
        --primary-color: #000000;
      }
      :root.light {
        --primary-color: #ffffff;
      }
      .button { color: var(--primary-color); }
    `;
    const result = process(source);

    // Should preserve the :root selectors and vars since they're part of larger selectors
    expect(result).toContain(":root.dark");
    expect(result).toContain(":root.light");
    expect(result).toContain("var(--primary-color)");
  });
});
