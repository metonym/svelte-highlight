import hljsFactory from "highlight.js/lib/core";
import patchedCsharp from "../scripts/hljs-patches/csharp.js";
import { createRegistry } from "../src/engine.js";
import csharp from "../src/languages/csharp.js";

// scripts/hljs-patches/csharp.js: `checked`, C# 13 `allows`, and the C# 11
// `u8` string suffix.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("csharp", patchedCsharp.register);

const registry = createRegistry();
registry.register(csharp.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "csharp" }).value;
  const actual = registry.highlight(code, { language: "csharp" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("csharp grammar patch", () => {
  it("styles checked like unchecked", () => {
    const html = expectMatchesHljs("checked { x++; }\nunchecked { y++; }");
    expect(html).toContain('<span class="hljs-keyword">checked</span>');
    expect(html).toContain('<span class="hljs-keyword">unchecked</span>');
  });

  it("styles allows ref struct in a class-header constraint", () => {
    const html = expectMatchesHljs("class C<T> where T : allows ref struct {}");
    expect(html).toContain(
      '<span class="hljs-keyword">where</span> <span class="hljs-title">T</span> : <span class="hljs-keyword">allows</span> <span class="hljs-keyword">ref</span> <span class="hljs-keyword">struct</span>',
    );
  });

  it("styles allows in a method-level constraint", () => {
    const html = expectMatchesHljs(
      "void M<T>() where T : allows ref struct {}",
    );
    expect(html).toContain(
      '<span class="hljs-keyword">allows</span> <span class="hljs-keyword">ref</span> <span class="hljs-keyword">struct</span>',
    );
  });

  it("styles struct and notnull constraints in a class header", () => {
    const html = expectMatchesHljs("class Box<T> where T : struct, notnull {}");
    expect(html).toContain(
      '<span class="hljs-keyword">struct</span>, <span class="hljs-keyword">notnull</span>',
    );
  });

  it("includes the u8 suffix in regular and raw string literals", () => {
    const html = expectMatchesHljs(
      'ReadOnlySpan<byte> a = "hi"u8;\nvar b = """\n  raw\n  """u8;',
    );
    expect(html).toContain('<span class="hljs-string">&quot;hi&quot;u8</span>');
    expect(html).toContain("&quot;&quot;&quot;u8</span>");
  });

  it("keeps plain, verbatim, and interpolated strings unchanged", () => {
    const html = expectMatchesHljs(
      'var a = "plain"; var b = @"C:\\x"; var c = $"n={n}";',
    );
    expect(html).toContain(
      '<span class="hljs-string">&quot;plain&quot;</span>',
    );
    expect(html).toContain(
      '<span class="hljs-string">@&quot;C:\\x&quot;</span>',
    );
    expect(html).toContain('<span class="hljs-subst">{n}</span>');
  });
});
