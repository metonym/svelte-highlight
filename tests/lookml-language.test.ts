import { createRegistry } from "../src/engine.js";

import lookml from "../src/languages/lookml";

const registry = createRegistry();

registry.register(lookml.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "lookml" }).value;

test("lookml highlights block headers with the name as title.class", () => {
  const result = highlight("view: orders {");

  expect(result).toContain('<span class="hljs-keyword">view</span>');
  expect(result).toContain('<span class="hljs-title class_">orders</span>');
});

test("lookml highlights generic keys as attrs", () => {
  const result = highlight("primary_key: yes");

  expect(result).toContain('<span class="hljs-attr">primary_key</span>');
});

test("lookml highlights literal values", () => {
  const result = highlight("type: count_distinct");

  expect(result).toContain('<span class="hljs-literal">count_distinct</span>');
});

test("lookml highlights sql values as embedded SQL up to ;;", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: ${TABLE} is LookML syntax, not JS interpolation
  const result = highlight("sql: ${TABLE}.id ;;");

  expect(result).toContain('<span class="hljs-attr">sql:</span>');
  expect(result).toContain(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: ${TABLE} is LookML syntax, not JS interpolation
    '<span class="hljs-template-variable">${TABLE}</span>',
  );
});

test("lookml highlights Liquid template variables", () => {
  const result = highlight("html: {{ value }} {% parameter x %}");

  expect(result).toContain(
    '<span class="hljs-template-variable">{{ value }}</span>',
  );
  expect(result).toContain(
    '<span class="hljs-template-variable">{% parameter x %}</span>',
  );
});

test("lookml highlights comments and strings", () => {
  const result = highlight('# a comment\nlabel: "Orders"');

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;Orders&quot;</span>',
  );
});

test("lookml highlights refinements and access_grant / aggregate_table blocks", () => {
  const result = highlight(
    "view: +orders {\n  measure: extra {\n    type: count\n  }\n}\naccess_grant: can_view {\n  user_attribute: department\n}\nexplore: orders {\n  aggregate_table: sales_monthly {\n    query: {\n      dimensions: [id]\n    }\n  }\n}",
  );

  expect(result).toContain('<span class="hljs-keyword">view</span>');
  expect(result).toContain('<span class="hljs-title class_">+orders</span>');
  expect(result).toContain('<span class="hljs-keyword">access_grant</span>');
  expect(result).toContain('<span class="hljs-title class_">can_view</span>');
  expect(result).toContain('<span class="hljs-keyword">aggregate_table</span>');
  expect(result).toContain(
    '<span class="hljs-title class_">sales_monthly</span>',
  );
});

test("lookml does not let sql_table_name swallow a later sql field", () => {
  const result = highlight(
    "view: orders {\n  sql_table_name: schema.orders\n  dimension: id {\n    sql: SELECT id ;;\n  }\n}",
  );

  expect(result).toContain('<span class="hljs-attr">sql_table_name</span>');
  expect(result).toContain('<span class="hljs-keyword">dimension</span>');
  expect(result).toContain('<span class="hljs-title class_">id</span>');
  expect(result).toContain('<span class="hljs-attr">sql:</span>');
});
