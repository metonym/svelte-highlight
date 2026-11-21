import hljsFactory from "highlight.js/lib/core";
import patchedPhp from "../scripts/hljs-patches/php.js";
import { createRegistry } from "../src/engine.js";
import php from "../src/languages/php.js";

// scripts/hljs-patches/php.js: property hooks and asymmetric visibility.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("php", patchedPhp.register);

const registry = createRegistry();
registry.register(php.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "php" }).value;
  const actual = registry.highlight(code, { language: "php" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("php grammar patch", () => {
  it("styles get and set property hooks as keywords", () => {
    const html = expectMatchesHljs(
      "class U {\n    public string $name {\n        get => strtoupper($this->name);\n        set(string $v) {\n            $this->name = trim($v);\n        }\n    }\n}",
    );
    expect(html).toContain('<span class="hljs-keyword">get</span> =&gt;');
    expect(html).toContain(
      '<span class="hljs-keyword">set</span>(<span class="hljs-keyword">string</span> <span class="hljs-variable">$v</span>) {',
    );
  });

  it("styles block-bodied and by-reference hooks", () => {
    const html = expectMatchesHljs(
      "class U {\n    public string $a { get { return 1; } set { } }\n    public array $b { &get => $this->b; }\n}",
    );
    expect(html).toContain('{ <span class="hljs-keyword">get</span> {');
    expect(html).toContain('} <span class="hljs-keyword">set</span> {');
    expect(html).toContain(
      '{ &amp;<span class="hljs-keyword">get</span> =&gt;',
    );
  });

  it("styles set in asymmetric visibility modifiers", () => {
    const html = expectMatchesHljs(
      "class U {\n    public private(set) string $id;\n    protected(set) int $age;\n}",
    );
    expect(html).toContain(
      '<span class="hljs-keyword">public</span> <span class="hljs-keyword">private</span>(<span class="hljs-keyword">set</span>) <span class="hljs-keyword">string</span>',
    );
    expect(html).toContain(
      '<span class="hljs-keyword">protected</span>(<span class="hljs-keyword">set</span>) <span class="hljs-keyword">int</span>',
    );
  });

  it("keeps get and set calls unchanged", () => {
    const html = expectMatchesHljs(
      "$cache->get('k');\n$cache->set('k', 1);\nCache::get('k');\nset($a, 1);\nif (get($a)) {}",
    );
    expect(html).toContain(
      '-&gt;<span class="hljs-title function_ invoke__">get</span>(',
    );
    expect(html).toContain(
      '-&gt;<span class="hljs-title function_ invoke__">set</span>(',
    );
    expect(html).toContain(
      '::<span class="hljs-title function_ invoke__">get</span>(',
    );
    expect(html).toContain(
      '<span class="hljs-title function_ invoke__">set</span>(<span class="hljs-variable">$a</span>',
    );
    expect(html).toContain(
      '(<span class="hljs-title function_ invoke__">get</span>(<span class="hljs-variable">$a</span>)) {}',
    );
  });

  it("keeps methods named get and set unchanged", () => {
    const html = expectMatchesHljs(
      "class C {\n    public function get() {}\n    function set($x) {}\n}",
    );
    expect(html).toContain(
      '<span class="hljs-keyword">function</span> <span class="hljs-title">get</span>',
    );
    expect(html).toContain(
      '<span class="hljs-keyword">function</span> <span class="hljs-title">set</span>',
    );
  });
});
