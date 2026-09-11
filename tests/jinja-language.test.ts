import { createRegistry, registerAll } from "../src/engine.js";

import jinja from "../src/languages/jinja";

const registry = createRegistry();

registerAll(registry, jinja);

const highlight = (code: string) =>
  registry.highlight(code, { language: "jinja" }).value;

const SEED = `{# greeting #}
{% macro hello(name) %}
  <p>Hello {{ name | e }}</p>
{% endmacro %}
{% for item in items %}
  {{ hello(item) }}
{% endfor %}
`;

test("jinja highlights tags, macros, and filters", () => {
  const result = highlight(SEED);

  expect(result).toContain("hljs-template-tag");
  expect(result).toContain('<span class="hljs-keyword">macro</span>');
  expect(result).toContain('<span class="hljs-keyword">endmacro</span>');
  expect(result).toContain('<span class="hljs-keyword">for</span>');
  expect(result).toContain('<span class="hljs-keyword">endfor</span>');
  expect(result).toContain('<span class="hljs-built_in">e</span>');
});

test("jinja highlights comments and strings", () => {
  const result = highlight('{# greeting #}\n{% include "header.html" %}');

  expect(result).toContain('<span class="hljs-comment">{# greeting #}</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;header.html&quot;</span>',
  );
});

test("jinja highlights nested output without treating braces as objects", () => {
  const result = highlight(
    "{% for item in items %}\n  {{ hello(item) }}\n{% endfor %}",
  );

  expect(result).toContain("hljs-template-variable");
  expect(result).toContain('<span class="hljs-keyword">for</span>');
  expect(result).toContain('<span class="hljs-keyword">endfor</span>');
});

test("jinja delegates surrounding markup to html", () => {
  const result = highlight("<p>Hello {{ name | e }}</p>");

  expect(result).toContain("hljs-tag");
  expect(result).toContain('<span class="hljs-name">p</span>');
  expect(result).toContain("hljs-template-variable");
});

test("jinja highlights endset and both spellings of the constants", () => {
  const result = highlight(
    "{% set x %}a{% endset %}{% if y == none or z == True %}{{ False }}{% endif %}",
  );

  expect(result).toContain('<span class="hljs-keyword">endset</span>');
  expect(result).toContain('<span class="hljs-literal">none</span>');
  expect(result).toContain('<span class="hljs-literal">True</span>');
  expect(result).toContain('<span class="hljs-literal">False</span>');
});

test("jinja highlights expression operators inside output tags only", () => {
  const result = highlight(
    "{{ user.name if user.name else None }}{{ 'a' in items and not x }}{{ block.title }}{{ set }}",
  );

  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-keyword">else</span>');
  expect(result).toContain('<span class="hljs-literal">None</span>');
  expect(result).toContain('<span class="hljs-keyword">in</span>');
  expect(result).toContain('<span class="hljs-keyword">not</span>');
  // Statement keywords are ordinary variable names in an output tag.
  expect(result).not.toContain('<span class="hljs-keyword">block</span>');
  expect(result).not.toContain('<span class="hljs-keyword">set</span>');
});

test("jinja highlights tests after `is` as built-ins", () => {
  const result = highlight(
    "{% if x is not defined %}{{ n is divisibleby 3 }}{% endif %}{{ isotope }}",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">is</span> <span class="hljs-keyword">not</span> <span class="hljs-built_in">defined</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">is</span> <span class="hljs-built_in">divisibleby</span>',
  );
  expect(result).not.toContain('hljs-built_in">otope');
  expect(result).toContain("{{ isotope }}");
});

test("jinja highlights numbers with digit groups and exponents", () => {
  const result = highlight("{{ 1_000 + 42.1e2 - 7 }}{{ user_2 }}");

  expect(result).toContain('<span class="hljs-number">1_000</span>');
  expect(result).toContain('<span class="hljs-number">42.1e2</span>');
  expect(result).toContain('<span class="hljs-number">7</span>');
  expect(result).toContain("{{ user_2 }}");
});
