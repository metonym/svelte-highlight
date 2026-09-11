import hljsFactory from "highlight.js/lib/core";
import patchedC from "../scripts/hljs-patches/c.js";
import { createRegistry } from "../src/engine.js";
import c from "../src/languages/c.js";

// scripts/hljs-patches/c.js: C23 `nullptr` and `wb` bit-precise suffixes.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("c", patchedC.register);

const registry = createRegistry();
registry.register(c.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "c" }).value;
  const actual = registry.highlight(code, { language: "c" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("c grammar patch", () => {
  it("styles nullptr as a literal", () => {
    const html = expectMatchesHljs("int *p = nullptr;\nif (p == NULL) {}");
    expect(html).toContain('<span class="hljs-literal">nullptr</span>');
    expect(html).toContain('<span class="hljs-literal">NULL</span>');
  });

  it("includes wb and uwb suffixes in bit-precise integer literals", () => {
    const html = expectMatchesHljs(
      "_BitInt(8) x = 12wb;\nunsigned _BitInt(8) y = 3uwb + 4WBu;",
    );
    expect(html).toContain('<span class="hljs-number">12wb</span>');
    expect(html).toContain('<span class="hljs-number">3uwb</span>');
    expect(html).toContain('<span class="hljs-number">4WBu</span>');
  });

  it("keeps the existing integer and float suffixes unchanged", () => {
    const html = expectMatchesHljs(
      "long a = 5ULL; unsigned b = 10u; float f = 1.5f; int h = 0x1Fu;",
    );
    expect(html).toContain('<span class="hljs-number">5ULL</span>');
    expect(html).toContain('<span class="hljs-number">10u</span>');
    expect(html).toContain('<span class="hljs-number">1.5f</span>');
    expect(html).toContain('<span class="hljs-number">0x1Fu</span>');
  });
});
