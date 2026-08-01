import { createRegistry } from "../src/engine.js";

import cql from "../src/languages/cql";

const registry = createRegistry();

registry.register(cql.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "cql" }).value;

test("cql highlights statement keywords", () => {
  const result = highlight(
    "SELECT name, age FROM users WHERE id = 123 ALLOW FILTERING",
  );

  expect(result).toContain('<span class="hljs-keyword">SELECT</span>');
  expect(result).toContain('<span class="hljs-keyword">FROM</span>');
  expect(result).toContain('<span class="hljs-keyword">WHERE</span>');
  expect(result).toContain('<span class="hljs-keyword">ALLOW</span>');
  expect(result).toContain('<span class="hljs-keyword">FILTERING</span>');
});

test("cql is case-insensitive for keywords", () => {
  const result = highlight("select * from users");

  expect(result).toContain('<span class="hljs-keyword">select</span>');
  expect(result).toContain('<span class="hljs-keyword">from</span>');
});

test("cql highlights column types in a CREATE TABLE statement", () => {
  const result = highlight(
    "CREATE TABLE users (id UUID PRIMARY KEY, name TEXT, age INT)",
  );

  expect(result).toContain('<span class="hljs-keyword">CREATE</span>');
  expect(result).toContain('<span class="hljs-keyword">TABLE</span>');
  expect(result).toContain('<span class="hljs-type">UUID</span>');
  expect(result).toContain('<span class="hljs-type">TEXT</span>');
  expect(result).toContain('<span class="hljs-type">INT</span>');
  expect(result).toContain('<span class="hljs-keyword">PRIMARY</span>');
  expect(result).toContain('<span class="hljs-keyword">KEY</span>');
});

test("cql highlights USING TTL and bind markers", () => {
  const result = highlight(
    "INSERT INTO users (id, name) VALUES (?, :name) USING TTL 86400",
  );

  expect(result).toContain('<span class="hljs-keyword">USING</span>');
  expect(result).toContain('<span class="hljs-keyword">TTL</span>');
  expect(result).toContain('<span class="hljs-variable">?</span>');
  expect(result).toContain('<span class="hljs-variable">:name</span>');
});

test("cql highlights string literals with doubled quote escapes", () => {
  const result = highlight("INSERT INTO users (name) VALUES ('O''Brien')");

  expect(result).toContain(
    '<span class="hljs-string">&#x27;O&#x27;&#x27;Brien&#x27;</span>',
  );
});

test("cql highlights UUID literals", () => {
  const result = highlight(
    "SELECT * FROM users WHERE id = 123e4567-e89b-12d3-a456-426614174000",
  );

  expect(result).toContain(
    '<span class="hljs-meta">123e4567-e89b-12d3-a456-426614174000</span>',
  );
});

test("cql highlights built-in functions", () => {
  const result = highlight("SELECT count(*), writetime(name) FROM users");

  expect(result).toContain('<span class="hljs-built_in">count</span>');
  expect(result).toContain('<span class="hljs-built_in">writetime</span>');
});

test("cql highlights line and block comments", () => {
  const lineComment = highlight("-- fetch active users\nSELECT * FROM users");
  const blockComment = highlight(
    "/* fetch active users */\nSELECT * FROM users",
  );

  expect(lineComment).toContain(
    '<span class="hljs-comment">-- fetch active users</span>',
  );
  expect(blockComment).toContain(
    '<span class="hljs-comment">/* fetch active users */</span>',
  );
});
