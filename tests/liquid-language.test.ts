import { createRegistry, registerAll } from "../src/engine.js";

import liquid from "../src/languages/liquid";

const registry = createRegistry();

registerAll(registry, liquid);

const highlight = (code: string) =>
  registry.highlight(code, { language: "liquid" }).value;

test("liquid highlights output objects", () => {
  const result = highlight("{{ product.title }}");

  expect(result).toContain("hljs-template-variable");
});

test("liquid highlights tags and keywords", () => {
  const result = highlight("{% if user %}hi{% endif %}");

  expect(result).toContain("hljs-template-tag");
  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-keyword">endif</span>');
});

test("liquid highlights filters", () => {
  const result = highlight("{{ name | upcase }}");

  expect(result).toContain('<span class="hljs-built_in">upcase</span>');
});

test("liquid delegates surrounding markup to xml", () => {
  const result = highlight("<h1>{{ title }}</h1>");

  expect(result).toContain("hljs-tag");
});

test("liquid treats comment blocks as opaque comments", () => {
  const result = highlight(
    "{% comment %}{% if user %}{{ title }}{% endif %}{% endcomment %}",
  );

  expect(result).toContain(
    '<span class="hljs-comment">{% comment %}{% if user %}{{ title }}{% endif %}{% endcomment %}</span>',
  );
  expect(result).not.toContain("hljs-template-tag");
  expect(result).not.toContain("hljs-template-variable");
});
