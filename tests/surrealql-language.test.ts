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
