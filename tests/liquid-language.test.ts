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

test("liquid highlights Shopify theme tags and literals", () => {
  const result = highlight(
    "{% paginate items by 5 %}{% endpaginate %}\n{% form 'contact' %}{% endform %}\n{{ product.title | default: \"n/a\", allow_false: true }} {{ nil }}",
  );

  expect(result).toContain('<span class="hljs-keyword">paginate</span>');
  expect(result).toContain('<span class="hljs-keyword">endform</span>');
  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-literal">nil</span>');
});

test("liquid treats inline # comments and doc blocks as comments", () => {
  const result = highlight(
    "{% # a note %}\n{%- # trimmed -%}\n{% doc %}\n  @param x\n{% enddoc %}\n{% assign y = 1 %}",
  );

  expect(result).toContain('<span class="hljs-comment">{% # a note %}</span>');
  expect(result).toContain(
    '<span class="hljs-comment">{%- # trimmed -%}</span>',
  );
  expect(result).toContain('<span class="hljs-comment">{% doc %}');
  expect(result).toContain('<span class="hljs-keyword">assign</span>');
});

test("liquid does not parse template syntax inside raw blocks", () => {
  const result = highlight(
    "{% raw %}{{ not parsed }} {% nope %}{% endraw %}{{ parsed }}",
  );

  expect(result).not.toContain(
    '<span class="hljs-template-variable">{{ not parsed }}</span>',
  );
  expect(result).toContain(
    '<span class="hljs-template-variable">{{ parsed }}</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">raw</span>');
});

test("liquid highlights schema bodies as JSON", () => {
  const result = highlight(
    '{% schema %}\n{ "name": "Hero", "settings": [] }\n{% endschema %}',
  );

  expect(result).toContain('<span class="hljs-keyword">schema</span>');
  expect(result).toContain('<span class="hljs-attr">&quot;name&quot;</span>');
  expect(result).toContain('<span class="hljs-keyword">endschema</span>');
});
