import hljsFactory from "highlight.js/lib/core";
import patchedRust from "../scripts/hljs-patches/rust.js";
import { createRegistry } from "../src/engine.js";
import rust from "../src/languages/rust.js";

// scripts/hljs-patches/rust.js: `drop` built-in (stock spelled it "drop "),
// extra std macros, and Rust 1.77 C-string literals.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("rust", patchedRust.register);

const registry = createRegistry();
registry.register(rust.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "rust" }).value;
  const actual = registry.highlight(code, { language: "rust" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("rust grammar patch", () => {
  it("styles a bare drop reference as a built-in", () => {
    const html = expectMatchesHljs("items.into_iter().for_each(drop);");
    expect(html).toContain('<span class="hljs-built_in">drop</span>');
  });

  it("styles dbg!, todo!, and matches! as built-in macros", () => {
    const html = expectMatchesHljs(
      "dbg!(x);\ntodo!();\nassert!(matches!(v, Some(_)));",
    );
    expect(html).toContain('<span class="hljs-built_in">dbg!</span>');
    expect(html).toContain('<span class="hljs-built_in">todo!</span>');
    expect(html).toContain('<span class="hljs-built_in">matches!</span>');
  });

  it("styles c-string and raw c-string literals as strings", () => {
    const html = expectMatchesHljs(
      'let a = c"hello";\nlet b = cr#"raw "quoted""#;',
    );
    expect(html).toContain(
      '<span class="hljs-string">c&quot;hello&quot;</span>',
    );
    expect(html).toContain(
      '<span class="hljs-string">cr#&quot;raw &quot;quoted&quot;&quot;#</span>',
    );
  });

  it("keeps byte strings and lifetimes unchanged", () => {
    const html = expectMatchesHljs(
      "let a = b\"bytes\";\nfn f<'a>(x: &'a str) -> &'a str { x }",
    );
    expect(html).toContain(
      '<span class="hljs-string">b&quot;bytes&quot;</span>',
    );
    expect(html).toContain('<span class="hljs-symbol">&#x27;a</span>');
  });
});
