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
