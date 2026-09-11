import hljsFactory from "highlight.js/lib/core";
import patchedGo from "../scripts/hljs-patches/go.js";
import { createRegistry } from "../src/engine.js";
import go from "../src/languages/go.js";

// scripts/hljs-patches/go.js: Go 1.18 `any`/`comparable`, Go 1.21
// `min`/`max`/`clear`, and a keyword-aware `[T any]` type-parameter list.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("go", patchedGo.register);

const registry = createRegistry();
registry.register(go.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "go" }).value;
  const actual = registry.highlight(code, { language: "go" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("go grammar patch", () => {
  it("styles any and comparable as types", () => {
    const html = expectMatchesHljs("var x any\nfunc f(v any, k comparable) {}");
    expect(html).toContain('<span class="hljs-type">any</span>');
    expect(html).toContain('<span class="hljs-type">comparable</span>');
  });

  it("styles min, max, and clear as built-ins", () => {
    const html = expectMatchesHljs("clear(m)\nreturn min(a, max(b, c))");
    expect(html).toContain('<span class="hljs-built_in">clear</span>');
    expect(html).toContain('<span class="hljs-built_in">min</span>');
    expect(html).toContain('<span class="hljs-built_in">max</span>');
  });

  it("styles constraints inside a type-parameter list, not as titles", () => {
    const html = expectMatchesHljs(
      "func Map[T any, U comparable](xs []T) []U {",
    );
    expect(html).toContain('<span class="hljs-title">Map</span>');
    expect(html).toContain(
      '[T <span class="hljs-type">any</span>, U <span class="hljs-type">comparable</span>]',
    );
    expect(html).not.toContain('<span class="hljs-title">any</span>');
  });

  it("leaves a plain function signature unchanged", () => {
    const html = expectMatchesHljs(
      "func add(a int, b int) int {\n\treturn a + b\n}",
    );
    expect(html).toContain('<span class="hljs-title">add</span>');
    expect(html).toContain(
      '<span class="hljs-params">(a <span class="hljs-type">int</span>, b <span class="hljs-type">int</span>)</span>',
    );
  });
});
