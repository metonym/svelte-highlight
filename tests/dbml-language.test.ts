import { createRegistry } from "../src/engine.js";

import dbml from "../src/languages/dbml";

const registry = createRegistry();

registry.register(dbml.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "dbml" }).value;

test("dbml highlights table declarations and column types", () => {
  const result = highlight("Table users {\n  id integer [pk]\n}");

  expect(result).toContain('<span class="hljs-keyword">Table</span>');
  expect(result).toContain('<span class="hljs-title">users</span>');
  expect(result).toContain('<span class="hljs-type">integer</span>');
});

test("dbml highlights multi-word column settings", () => {
  const result = highlight("username varchar [not null, unique]");

  expect(result).toContain('<span class="hljs-meta">not null</span>');
  expect(result).toContain('<span class="hljs-meta">unique</span>');
  expect(result).toContain('<span class="hljs-type">varchar</span>');
});

test("dbml highlights relationship operators, longest first", () => {
  const result = highlight(
    "Ref: a.b <> b.a\nRef: posts.user_id > users.id\nRef: a.b - b.a",
  );

  expect(result).toContain('<span class="hljs-operator">&lt;&gt;</span>');
  expect(result).toContain('<span class="hljs-operator">&gt;</span>');
  expect(result).toContain('<span class="hljs-operator">-</span>');
});

test("dbml highlights comments and strings", () => {
  const result = highlight("// authors\nNote: 'User accounts'");

  expect(result).toContain('<span class="hljs-comment">// authors</span>');
  expect(result).toContain(
    '<span class="hljs-string">&#x27;User accounts&#x27;</span>',
  );
});

test("dbml does not treat a lowercase table word as a keyword", () => {
  const result = highlight("table_name varchar");

  expect(result).not.toContain('<span class="hljs-keyword">table');
  expect(result).toContain('<span class="hljs-type">varchar</span>');
});
