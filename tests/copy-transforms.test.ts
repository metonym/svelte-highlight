import { stripDiffMarkers, stripPrompts } from "../src/copy-transforms.js";

describe("stripPrompts", () => {
  it("strips the default `$ ` prompt and leaves output lines untouched", () => {
    const code = "$ npm i\nadded 1 package";
    expect(stripPrompts(code)).toBe("npm i\nadded 1 package");
  });

  it("strips the default `> ` prompt", () => {
    const code = "> 1 + 1\n2";
    expect(stripPrompts(code)).toBe("1 + 1\n2");
  });

  it("handles a mix of prompted and output lines in one block", () => {
    const code = "$ npm i\nadded 1 package\n$ npm test\nok";
    expect(stripPrompts(code)).toBe("npm i\nadded 1 package\nnpm test\nok");
  });

  it("accepts a custom prompt list", () => {
    const code = "In [1]: 1 + 1\nOut[1]: 2";
    expect(stripPrompts(code, ["In [1]: ", "Out[1]: "])).toBe("1 + 1\n2");
  });

  it("leaves lines without a matching prompt unchanged", () => {
    const code = "plain line";
    expect(stripPrompts(code)).toBe("plain line");
  });
});

describe("stripDiffMarkers", () => {
  it("leaves context lines untouched", () => {
    const code = "  function foo() {\n  }";
    expect(stripDiffMarkers(code)).toBe("  function foo() {\n  }");
  });

  it("strips a `+ ` / `- ` marker and preserves indentation exactly", () => {
    const code = "-   return 1;\n+   return 2;";
    expect(stripDiffMarkers(code)).toBe("  return 1;\n  return 2;");
  });

  it("strips a bare `+`/`-` immediately before content", () => {
    const code = "+return 2;\n-return 1;";
    expect(stripDiffMarkers(code)).toBe("return 2;\nreturn 1;");
  });

  it("handles a full block of context and changed lines", () => {
    const code = "  function foo() {\n-   return 1;\n+   return 2;\n  }";
    expect(stripDiffMarkers(code)).toBe(
      "  function foo() {\n  return 1;\n  return 2;\n  }",
    );
  });
});
