import { createRegistry } from "../src/engine.js";
import typescript from "../src/languages/typescript.js";

const registry = createRegistry();
registry.register(typescript.register);

const tokenize = (code: string) =>
  registry.tokenizeRanges(code, { language: "typescript" });

// Mirrors the engine's own scope-name -> CSS-class conversion (see
// `scopeToCssClass` in src/engine.js) so a token's `scope` can be
// cross-checked against the classes the HTML renderer produces.
function scopeToClassAttr(scope: string): string {
  if (!scope.includes(".")) return `hljs-${scope}`;
  const pieces = scope.split(".");
  const first = pieces.shift();
  return [
    `hljs-${first}`,
    ...pieces.map((piece, i) => `${piece}${"_".repeat(i + 1)}`),
  ].join(" ");
}

describe("tokenizeRanges", () => {
  it("returns ranges sorted and non-overlapping after flattening", () => {
    const code =
      "const value = 42; // done\nfunction greet(name) { return name; }";
    const ranges = tokenize(code);

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
    const ranges = tokenize(code);

    const keyword = ranges.find(
      (range) => code.slice(range.start, range.end) === "const",
    );
    expect(keyword?.scope).toBe("keyword");

    const comment = ranges.find((range) =>
      code.slice(range.start, range.end).startsWith("//"),
    );
    expect(comment?.scope).toBe("comment");
  });

  it("matches the classes the HTML renderer produces for the same input", () => {
    const code =
      "const value = 42; // done\nfunction greet(name) { return name; }";
    const ranges = tokenize(code);
    const html = registry.highlight(code, { language: "typescript" }).value;

    for (const range of ranges) {
      const text = code.slice(range.start, range.end);
      const classAttr = scopeToClassAttr(range.scope);
      expect(html).toContain(`<span class="${classAttr}">${text}</span>`);
    }
  });

  it("returns an empty array for plain text with no tokens", () => {
    expect(tokenize("just some text")).toEqual([]);
  });
});
