import { createRegistry } from "../src/engine.js";

import c3 from "../src/languages/c3";

const registry = createRegistry();

registry.register(c3.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "c3" }).value;

test("c3 highlights the nextcase relevance carrier", () => {
  const result = highlight("nextcase default;");

  expect(result).toContain('<span class="hljs-keyword">nextcase</span>');
});

test("c3 highlights compile-time directives", () => {
  const result = highlight("$if $defined(x):\n$endif");

  expect(result).toContain('<span class="hljs-meta">$if</span>');
  expect(result).toContain('<span class="hljs-meta">$endif</span>');
});

test("c3 highlights attributes", () => {
  const result = highlight("@extern fn void foo();");

  expect(result).toContain('<span class="hljs-meta">@extern</span>');
  expect(result).toContain('<span class="hljs-keyword">fn</span>');
});

test("c3 highlights optional types and the rethrow operator", () => {
  const result = highlight("String? name;\nfoo()!;");

  expect(result).toContain('<span class="hljs-type">String</span>');
  expect(result).toContain('<span class="hljs-operator">?</span>');
  expect(result).toContain('<span class="hljs-operator">!</span>');
});

test("c3 highlights comments, strings, and numbers", () => {
  const result = highlight('// a comment\nint x = 42;\nString s = "hi";');

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain('<span class="hljs-number">42</span>');
  expect(result).toContain('<span class="hljs-string">&quot;hi&quot;</span>');
});
