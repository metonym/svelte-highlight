import { createRegistry, registerAll } from "../src/engine.js";

import baml from "../src/languages/baml";

const registry = createRegistry();

registerAll(registry, baml);

const highlight = (code: string) =>
  registry.highlight(code, { language: "baml" }).value;

test("baml highlights the function arrow", () => {
  const result = highlight("function Extract(text: string) -> Resume {");

  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
  expect(result).toContain('<span class="hljs-keyword">function</span>');
});

test("baml highlights attributes", () => {
  const result = highlight('@description("a field")');

  expect(result).toContain('<span class="hljs-meta">@description</span>');
});

test("baml highlights a prompt raw string as the relevance carrier", () => {
  const result = highlight('prompt #"hello"#');

  expect(result).toContain('<span class="hljs-string">');
});

test("baml highlights keywords and literals", () => {
  const result = highlight("class Resume {\n  valid: bool = true\n}");

  expect(result).toContain('<span class="hljs-keyword">class</span>');
  expect(result).toContain('<span class="hljs-keyword">bool</span>');
  expect(result).toContain('<span class="hljs-literal">true</span>');
});

test("baml highlights comments", () => {
  const result = highlight("// a comment\nclass Resume {}");

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
});
