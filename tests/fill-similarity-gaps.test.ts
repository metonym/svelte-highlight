import postcss from "postcss";
import { fillSimilarityGaps } from "../scripts/utils/fill-similarity-gaps";

describe("fillSimilarityGaps", () => {
  it("appends a color-only rule for each proposal", () => {
    const proposals = new Map([
      [".hljs-attr", "red"],
      [".hljs-tag", "blue"],
    ]);
    const output = postcss([fillSimilarityGaps(proposals)]).process("", {
      from: undefined,
    }).css;
    expect(output).toContain(".hljs-attr {\n    color: red\n}");
    expect(output).toContain(".hljs-tag {\n    color: blue\n}");
  });

  it("is a no-op for an empty proposal map", () => {
    const output = postcss([fillSimilarityGaps(new Map())]).process(
      ".hljs-attr { color: red }",
      { from: undefined },
    ).css;
    expect(output).toBe(".hljs-attr { color: red }");
  });
});
