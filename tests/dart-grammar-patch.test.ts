import hljsFactory from "highlight.js/lib/core";
import patchedDart from "../scripts/hljs-patches/dart.js";
import { createRegistry } from "../src/engine.js";
import dart from "../src/languages/dart.js";

// scripts/hljs-patches/dart.js: `with` / `on` inside a class header.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("dart", patchedDart.register);

const registry = createRegistry();
registry.register(dart.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "dart" }).value;
  const actual = registry.highlight(code, { language: "dart" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("dart grammar patch", () => {
  it("styles with as a keyword in a class header", () => {
    const html = expectMatchesHljs("class A extends B with M implements C {}");
    expect(html).toContain(
      '<span class="hljs-keyword">extends</span> <span class="hljs-title">B</span> <span class="hljs-keyword">with</span> <span class="hljs-title">M</span> <span class="hljs-keyword">implements</span>',
    );
  });

  it("styles on in a mixin class header", () => {
    const html = expectMatchesHljs("mixin class N on Base {}");
    expect(html).toContain(
      '<span class="hljs-title">N</span> <span class="hljs-keyword">on</span> <span class="hljs-title">Base</span>',
    );
  });

  it("keeps a plain class header and a mixin declaration unchanged", () => {
    const html = expectMatchesHljs("class P {}\nmixin M on Base {}");
    expect(html).toContain(
      '<span class="hljs-keyword">class</span> <span class="hljs-title">P</span>',
    );
    expect(html).toContain(
      '<span class="hljs-keyword">mixin</span> M <span class="hljs-keyword">on</span> <span class="hljs-title class_">Base</span>',
    );
  });
});
