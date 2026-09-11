import { createRegistry, registerAll } from "../src/engine.js";

import markdoc from "../src/languages/markdoc";

const registry = createRegistry();

registerAll(registry, markdoc);

const highlight = (code: string) =>
  registry.highlight(code, { language: "markdoc" }).value;

test("markdoc highlights tag delimiters with high relevance", () => {
  const result = highlight('{% callout type="warning" %}');

  expect(result).toContain('<span class="hljs-template-tag">{%</span>');
  expect(result).toContain('<span class="hljs-template-tag">%}</span>');
});

test("markdoc highlights the tag name", () => {
  const result = highlight('{% callout type="warning" %}');

  expect(result).toContain('<span class="hljs-title function_">callout</span>');
});

test("markdoc highlights attribute names and string values", () => {
  const result = highlight('{% callout type="warning" %}');

  expect(result).toContain('<span class="hljs-attr">type</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;warning&quot;</span>',
  );
});

test("markdoc highlights variables and built-in functions", () => {
  const result = highlight('{% if(equals($name, "")) %}');

  expect(result).toContain('<span class="hljs-variable">$name</span>');
  expect(result).toContain('<span class="hljs-built_in">equals</span>');
});

test("markdoc highlights closing and self-closing markers", () => {
  const result = highlight('{% /callout %}\n{% partial file="a.md" /%}');

  expect(result).toContain('<span class="hljs-template-tag">/</span>');
});

test("markdoc highlights comment tags", () => {
  const result = highlight("{% comment %} note {% /comment %}");

  expect(result).toContain(
    '<span class="hljs-comment">{% comment %} note {% /comment %}</span>',
  );
});

test("markdoc does not treat a table separator as YAML frontmatter", () => {
  const result = highlight(`{% table %}
* Col
---
* Cell
{% /table %}
`);

  expect(result).toContain('<span class="hljs-title function_">table</span>');
  expect(result).toContain('<span class="hljs-template-tag">/</span>');
});

test("markdoc still highlights YAML frontmatter at the start", () => {
  const result = highlight(`---
title: Hello
---

# Hi
`);

  expect(result).toContain('<span class="language-yaml">');
  expect(result).toContain('<span class="hljs-attr">title:</span>');
});
