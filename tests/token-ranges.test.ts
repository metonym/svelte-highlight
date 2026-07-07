import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import { tokenize } from "../src/token-ranges.js";

hljs.registerLanguage("typescript", typescript);

// Mirrors hljs's own scope-name -> CSS-class conversion (see
// `scopeToCSSClass` in highlight.js/lib/core.js) so a token's `scope` can be
// cross-checked against the classes the real HTML renderer produces.
function scopeToClassAttr(scope: string): string {
  if (!scope.includes(".")) return `hljs-${scope}`;
  const pieces = scope.split(".");
  const first = pieces.shift();
  return [
    `hljs-${first}`,
    ...pieces.map((piece, i) => `${piece}${"_".repeat(i + 1)}`),
  ].join(" ");
}

describe("tokenize", () => {
  it("returns ranges sorted and non-overlapping after flattening", () => {
    const code =
      "const value = 42; // done\nfunction greet(name) { return name; }";
    const ranges = tokenize(code, "typescript");

    expect(ranges.length).toBeGreaterThan(0);
    let previousEnd = Number.NEGATIVE_INFINITY;
    for (const range of ranges) {
      expect(range.start).toBeGreaterThanOrEqual(previousEnd);
      previousEnd = range.end;
    }
  });

  it("keeps token offsets aligned with the source string", () => {
    const code =
      "const value = 42; // done\nfunction greet(name) { return name; }";
    const ranges = tokenize(code, "typescript");

    const keyword = ranges.find(
      (range) => code.slice(range.start, range.end) === "const",
    );
    expect(keyword?.scope).toBe("keyword");

    const comment = ranges.find((range) =>
      code.slice(range.start, range.end).startsWith("//"),
    );
    expect(comment?.scope).toBe("comment");
  });

  it("matches the classes hljs's HTML renderer produces for the same input", () => {
    const code =
      "const value = 42; // done\nfunction greet(name) { return name; }";
    const ranges = tokenize(code, "typescript");
    const html = hljs.highlight(code, { language: "typescript" }).value;

    for (const range of ranges) {
      const text = code.slice(range.start, range.end);
      const classAttr = scopeToClassAttr(range.scope);
      expect(html).toContain(`<span class="${classAttr}">${text}</span>`);
    }
  });

  it("returns an empty array for plain text with no tokens", () => {
    expect(tokenize("just some text", "typescript")).toEqual([]);
  });

  it("does not leak its emitter into subsequent default highlight() calls", () => {
    tokenize("const a = 1;", "typescript");
    const html = hljs.highlight("const a = 1;", {
      language: "typescript",
    }).value;
    expect(html).toBe(
      '<span class="hljs-keyword">const</span> a = <span class="hljs-number">1</span>;',
    );
  });
});
