import hljsFactory from "highlight.js/lib/core";
import patchedPython from "../scripts/hljs-patches/python.js";
import { createRegistry } from "../src/engine.js";
import python from "../src/languages/python.js";

// scripts/hljs-patches/python.js: PEP 695 `type` alias statements and a
// fuller `typing` names list.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("python", patchedPython.register);

const registry = createRegistry();
registry.register(python.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "python" }).value;
  const actual = registry.highlight(code, { language: "python" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("python grammar patch", () => {
  it("styles a type alias statement as keyword + class title", () => {
    const html = expectMatchesHljs("type Point = tuple[float, float]");
    expect(html).toContain(
      '<span class="hljs-keyword">type</span> <span class="hljs-title class_">Point</span>',
    );
  });

  it("styles a generic type alias statement", () => {
    const html = expectMatchesHljs("type ListOrSet[T] = list[T] | set[T]");
    expect(html).toContain(
      '<span class="hljs-keyword">type</span> <span class="hljs-title class_">ListOrSet</span>[T]',
    );
  });

  it("keeps type() calls and comparisons as the built-in", () => {
    const html = expectMatchesHljs(
      "kind = type(value)\nif type == expected:\n    pass",
    );
    expect(html).toContain('<span class="hljs-built_in">type</span>(value)');
    expect(html).toContain(
      '<span class="hljs-built_in">type</span> == expected',
    );
    expect(html).not.toContain('<span class="hljs-keyword">type</span>');
  });

  it("styles common typing names as types", () => {
    const html = expectMatchesHljs(
      "def f(items: Iterable[Self]) -> Protocol: ...\nx: Final[TypeGuard[int]]",
    );
    expect(html).toContain('<span class="hljs-type">Iterable</span>');
    expect(html).toContain('<span class="hljs-type">Self</span>');
    expect(html).toContain('<span class="hljs-type">Protocol</span>');
    expect(html).toContain('<span class="hljs-type">Final</span>');
    expect(html).toContain('<span class="hljs-type">TypeGuard</span>');
  });

  it("does not let the new typing names boost relevance", () => {
    const code = "Iterable Protocol Self TypeVar";
    expect(registry.highlight(code, { language: "python" }).relevance).toBe(0);
  });
});
