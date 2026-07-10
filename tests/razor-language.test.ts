import { createRegistry } from "../src/engine.js";

import razor from "../src/languages/razor";

const registry = createRegistry();

registry.register(razor.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "razor" }).value;

test("razor highlights directives as meta", () => {
  const result = highlight("@page\n@model Foo");

  expect(result).toContain('<span class="hljs-meta">@page</span>');
  expect(result).toContain('<span class="hljs-meta">@model</span>');
});

test("razor highlights inline expressions", () => {
  const result = highlight("<div>@Name</div>");

  expect(result).toContain('<span class="hljs-template-variable">@Name</span>');
});

test("razor highlights html tags", () => {
  const result = highlight("<div></div>");

  expect(result).toContain('<span class="hljs-tag">');
});

test("razor highlights razor comments", () => {
  const result = highlight("@* a comment *@");

  expect(result).toContain('<span class="hljs-comment">@* a comment *@</span>');
});

test("razor code blocks stay open through nested braces", () => {
  const result = highlight('@{ if (x) { DoSomething(); } var s = "leaked"; }');

  // content after the nested `}` but before the true closing `}` must still
  // be recognized as C# code, proving the block didn't end prematurely
  expect(result).toContain('<span class="hljs-keyword">var</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;leaked&quot;</span>',
  );
});

test("razor highlights @code blocks with nested braces as C#", () => {
  const result = highlight("@code { void Inc() { if (x) { count++; } } }");

  expect(result).toContain('<span class="hljs-keyword">code</span>');
  expect(result).toContain('<span class="hljs-keyword">if</span>');
});

test("razor highlights @functions blocks with nested braces as C#", () => {
  const result = highlight(
    "@functions { int Add(int a, int b) { return a + b; } }",
  );

  expect(result).toContain('<span class="hljs-keyword">functions</span>');
  expect(result).toContain('<span class="hljs-keyword">return</span>');
});

test("razor highlights explicit @(...) expressions", () => {
  const result = highlight("@(model.Value + 1)");

  expect(result).toContain(
    '<span class="hljs-template-variable">@(model.Value + <span class="hljs-number">1</span>)</span>',
  );
});

test("razor highlights interpolated strings inside code blocks", () => {
  const result = highlight('@{ var s = $"Hello {name}"; }');

  expect(result).toContain('<span class="hljs-string">$&quot;Hello ');
  expect(result).toContain('<span class="hljs-subst">{name}</span>');
});
