import { createRegistry, registerAll } from "../src/engine.js";

import templ from "../src/languages/templ";

const registry = createRegistry();

registerAll(registry, templ);

const highlight = (code: string) =>
  registry.highlight(code, { language: "templ" }).value;

test("templ highlights package declarations as Go", () => {
  const result = highlight("package main");

  expect(result).toContain('<span class="hljs-keyword">package</span>');
});

test("templ highlights component declarations and nested markup", () => {
  const result = highlight(
    "templ Hello(name string) {\n\t<h1>{ name }</h1>\n}",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">templ <span class="hljs-title function_">Hello</span>(<span class="language-go">name <span class="hljs-type">string</span></span>) {</span>',
  );
  expect(result).toContain('<span class="language-html">');
  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-name">h1</span>&gt;</span>',
  );
  expect(result).toContain('<span class="language-go">{ name }</span>');
});

test("templ highlights Go control flow inside a component body", () => {
  const result = highlight(
    "templ Page() {\n\tif isActive {\n\t\t<span>Active</span>\n\t}\n}",
  );

  expect(result).toContain('<span class="hljs-keyword">if isActive {</span>');
  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-name">span</span>&gt;</span>',
  );
});

test("templ resumes highlighting a second component after a control-flow body closes", () => {
  const result = highlight(
    "templ A() {\n\tif x {\n\t\t<div></div>\n\t}\n}\n\ntempl B() {\n\t<span></span>\n}",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">templ <span class="hljs-title function_">B</span>() {</span>',
  );
  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-name">span</span>&gt;</span>',
  );
});

test("templ highlights component calls with @", () => {
  const result = highlight("templ Page() {\n\t@Footer()\n}");

  expect(result).toContain(
    '<span class="hljs-template-variable">@Footer</span>',
  );
});

test("templ highlights range loops inside a component body", () => {
  const result = highlight(
    "templ Page() {\n\tfor _, item := range items {\n\t\t<li>{ item.Name }</li>\n\t}\n}",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">for _, item := range items {</span>',
  );
});

test("templ highlights css component blocks as CSS", () => {
  const result = highlight("css button() {\n\tbackground-color: red;\n}");

  expect(result).toContain('<span class="hljs-keyword">css button() {</span>');
  expect(result).toContain('<span class="language-css">');
  expect(result).toContain(
    '<span class="hljs-attribute">background-color</span>',
  );
});

test("templ highlights script component blocks as JavaScript", () => {
  const result = highlight("script alert(msg string) {\n\talert(msg);\n}");

  expect(result).toContain('<span class="language-javascript">');
  expect(result).toContain(
    '<span class="hljs-title function_">alert</span>(msg);',
  );
});

test("templ script blocks balance nested braces in the JS body", () => {
  const result = highlight(
    'script greet(name string) {\n\tif (name) { alert("Hi " + name) }\n}',
  );

  // content after the nested `}` but before the true closing `}` must
  // still be recognized as JavaScript, proving the block didn't end
  // prematurely at the `if`'s own closing brace
  expect(result).toContain('<span class="hljs-title function_">alert</span>');
  expect(result).toContain('<span class="hljs-string">&quot;Hi &quot;</span>');
});

test("templ highlights line comments", () => {
  const result = highlight("// a comment\ntempl X() {\n\t<div></div>\n}");

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
});
