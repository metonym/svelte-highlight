import hljsFactory from "highlight.js/lib/core";
import patchedJava from "../scripts/hljs-patches/java.js";
import { createRegistry } from "../src/engine.js";
import java from "../src/languages/java.js";

// scripts/hljs-patches/java.js: `const` (stock spelled it "const ").
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("java", patchedJava.register);

const registry = createRegistry();
registry.register(java.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "java" }).value;
  const actual = registry.highlight(code, { language: "java" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("java grammar patch", () => {
  it("styles the reserved word const as a keyword", () => {
    const html = expectMatchesHljs("const int x = 1;");
    expect(html).toContain('<span class="hljs-keyword">const</span>');
  });

  it("keeps neighbouring modifiers and declarations unchanged", () => {
    const html = expectMatchesHljs(
      "public static final int MAX = 10;\nrecord Point(int x, int y) {}",
    );
    expect(html).toContain(
      '<span class="hljs-keyword">static</span> <span class="hljs-keyword">final</span>',
    );
    expect(html).toContain(
      '<span class="hljs-keyword">record</span> <span class="hljs-title class_">Point</span>',
    );
  });
});
