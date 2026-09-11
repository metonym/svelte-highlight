import { createRegistry } from "../src/engine.js";

import surrealql from "../src/languages/surrealql";

const registry = createRegistry();

registry.register(surrealql.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "surrealql" }).value;

const SEED = `// users who wrote a post
DEFINE TABLE user SCHEMAFULL;
SELECT * FROM user:alice WHERE age > 18;
CREATE user SET name = "Ada";
RELATE user:alice->wrote->post:hello;
`;

test("surrealql highlights DEFINE SELECT CREATE RELATE and WHERE", () => {
  const result = highlight(SEED);

  expect(result).toContain('<span class="hljs-keyword">DEFINE</span>');
  expect(result).toContain('<span class="hljs-keyword">SELECT</span>');
  expect(result).toContain('<span class="hljs-keyword">CREATE</span>');
  expect(result).toContain('<span class="hljs-keyword">RELATE</span>');
  expect(result).toContain('<span class="hljs-keyword">WHERE</span>');
  expect(result).toContain('<span class="hljs-keyword">SCHEMAFULL</span>');
});

test("surrealql highlights comments and strings", () => {
  const result = highlight(
    '// users who wrote a post\nCREATE user SET name = "Ada";',
  );

  expect(result).toContain(
    '<span class="hljs-comment">// users who wrote a post</span>',
  );
  expect(result).toContain('<span class="hljs-string">&quot;Ada&quot;</span>');
});

test("surrealql highlights record ids and graph edges", () => {
  const result = highlight("RELATE user:alice->wrote->post:hello;");

  expect(result).toContain('<span class="hljs-symbol">user:alice</span>');
  expect(result).toContain('<span class="hljs-symbol">post:hello</span>');
  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
  expect(result).toContain('<span class="hljs-keyword">RELATE</span>');
});

test("surrealql highlights -- and # line comments without styling their words", () => {
  const result = highlight(
    "-- Define a table\n# select all\nDEFINE TABLE user;",
  );

  expect(result).toContain(
    '<span class="hljs-comment">-- Define a table</span>',
  );
  expect(result).toContain('<span class="hljs-comment"># select all</span>');
  expect(result).not.toContain('<span class="hljs-keyword">Define</span> a');
  expect(result).toContain('<span class="hljs-keyword">DEFINE</span>');
});

test("surrealql styles parameters as variables instead of keywords", () => {
  const result = highlight("ASSERT string::is::email($value) AND $auth.id;");

  expect(result).toContain('<span class="hljs-variable">$value</span>');
  expect(result).toContain('<span class="hljs-variable">$auth</span>');
  expect(result).not.toContain('$<span class="hljs-keyword">value</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">string::is::email</span>',
  );
});

test("surrealql highlights durations, numeric suffixes, and prefixed strings", () => {
  const result = highlight(
    'LET $d = 1h30m; LET $f = 3.14f; LET $n = 1_000_000dec; LET $t = d"2024-01-01T00:00:00Z"; LET $r = r"user:tobie";',
  );

  expect(result).toContain('<span class="hljs-number">1h30m</span>');
  expect(result).toContain('<span class="hljs-number">3.14f</span>');
  expect(result).toContain('<span class="hljs-number">1_000_000dec</span>');
  expect(result).toContain(
    '<span class="hljs-string">d&quot;2024-01-01T00:00:00Z&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">r&quot;user:tobie&quot;</span>',
  );
});

test("surrealql highlights transaction, insert, and set-operator keywords", () => {
  const result = highlight(
    "BEGIN TRANSACTION; INSERT INTO company (name) VALUES ('x'); UPDATE user SET age += 1 TIMEOUT 5s PARALLEL; SELECT * FROM t WHERE tags CONTAINSANY ['a'] AND id INSIDE [1]; COMMIT TRANSACTION;",
  );

  expect(result).toContain('<span class="hljs-keyword">BEGIN</span>');
  expect(result).toContain('<span class="hljs-keyword">TRANSACTION</span>');
  expect(result).toContain('<span class="hljs-keyword">INTO</span>');
  expect(result).toContain('<span class="hljs-keyword">TIMEOUT</span>');
  expect(result).toContain('<span class="hljs-keyword">PARALLEL</span>');
  expect(result).toContain('<span class="hljs-keyword">CONTAINSANY</span>');
  expect(result).toContain('<span class="hljs-keyword">INSIDE</span>');
  expect(result).toContain('<span class="hljs-keyword">COMMIT</span>');
  // `values` and `duration` are common field names, so they stay plain.
  expect(result).not.toContain('<span class="hljs-keyword">VALUES</span>');
  expect(highlight("SELECT duration FROM run;")).not.toContain(
    '<span class="hljs-keyword">duration</span>',
  );
  // A plain comparison keeps its record id and operator styling.
  expect(highlight("SELECT * FROM user:tobie WHERE age > 18;")).toContain(
    '<span class="hljs-symbol">user:tobie</span>',
  );
});
