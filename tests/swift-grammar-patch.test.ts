import hljsFactory from "highlight.js/lib/core";
import patchedSwift from "../scripts/hljs-patches/swift.js";
import { createRegistry } from "../src/engine.js";
import swift from "../src/languages/swift.js";

// scripts/hljs-patches/swift.js: `sending`, `nonisolated(unsafe)`, and the
// toolchain macros `#Preview` / `#expect` / `#require`.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("swift", patchedSwift.register);

const registry = createRegistry();
registry.register(swift.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "swift" }).value;
  const actual = registry.highlight(code, { language: "swift" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("swift grammar patch", () => {
  it("styles #Preview, #expect, and #require as keywords", () => {
    const html = expectMatchesHljs(
      "#Preview { ContentView() }\n#expect(x == 1)\nlet y = try #require(z)",
    );
    expect(html).toContain('<span class="hljs-keyword">#Preview</span> {');
    expect(html).toContain('<span class="hljs-keyword">#expect</span>(');
    expect(html).toContain('<span class="hljs-keyword">#require</span>(');
  });

  it("styles nonisolated(unsafe) as one keyword like unowned(unsafe)", () => {
    const html = expectMatchesHljs(
      "nonisolated(unsafe) var g = 0\nunowned(unsafe) let u = 1\nnonisolated func n() {}",
    );
    expect(html).toContain(
      '<span class="hljs-keyword">nonisolated(unsafe)</span>',
    );
    expect(html).toContain('<span class="hljs-keyword">unowned(unsafe)</span>');
    expect(html).toContain(
      '<span class="hljs-keyword">nonisolated</span> <span class="hljs-keyword">func</span>',
    );
  });

  it("styles sending as a keyword but not as a member name", () => {
    const html = expectMatchesHljs(
      "func f(_ x: sending Int) {}\nlet s = obj.sending",
    );
    expect(html).toContain(
      '<span class="hljs-keyword">sending</span> <span class="hljs-type">Int</span>',
    );
    expect(html).toContain("obj.sending");
    expect(html).not.toContain('.<span class="hljs-keyword">sending</span>');
  });

  it("keeps #available and attributes unchanged", () => {
    const html = expectMatchesHljs(
      "if #available(iOS 17, *) {}\n@MainActor class C {}",
    );
    expect(html).toContain('<span class="hljs-keyword">#available</span>');
    expect(html).toContain('<span class="hljs-meta">@MainActor</span>');
  });
});
