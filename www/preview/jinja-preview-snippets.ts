export type JinjaPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const jinjaPreviewSnippets: JinjaPreviewSnippet[] = [
  {
    title: "Macro with filter",
    description: "macro/endmacro and the e filter",
    code: `{# greeting #}
{% macro hello(name) %}
  <p>Hello {{ name | e }}</p>
{% endmacro %}
{{ hello("Ada") }}`,
  },
  {
    title: "For loop",
    description: "for/endfor over a list",
    code: `{% for item in items %}
  <li>{{ item | join(",") }}</li>
{% endfor %}`,
  },
  {
    title: "Include and comments",
    description: "hash-brace comments and string paths",
    code: `{# page chrome #}
{% include "header.html" %}
<p>{{ title }}</p>
{% include "footer.html" %}`,
  },
];
