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

  it("styles a C# 14 extension block", () => {
    const html = expectMatchesHljs(
      "public static class E\n{\n    extension(string s)\n    {\n        public bool IsEmpty => s.Length == 0;\n    }\n}",
    );
    expect(html).toContain(
      '<span class="hljs-keyword">extension</span>(<span class="hljs-built_in">string</span> s)',
    );
  });

  it("styles the C# 14 field keyword in an accessor", () => {
    const html = expectMatchesHljs(
      "public string Name { get; set => field = value.Trim(); }",
    );
    expect(html).toContain(
      '<span class="hljs-keyword">set</span> =&gt; <span class="hljs-keyword">field</span> = <span class="hljs-keyword">value</span>.Trim();',
    );
  });

  it("keeps accessors and a method declaration unchanged", () => {
    const html = expectMatchesHljs(
      "public int X { get; init; }\npublic void Run(int n) {}",
    );
    expect(html).toContain(
      '{ <span class="hljs-keyword">get</span>; <span class="hljs-keyword">init</span>; }',
    );
    expect(html).toContain(
      '<span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">void</span> <span class="hljs-title">Run</span>',
    );
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
