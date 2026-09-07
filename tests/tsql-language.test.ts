import { createRegistry } from "../src/engine.js";

import tsql from "../src/languages/tsql";

const registry = createRegistry();

registry.register(tsql.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "tsql" }).value;

test("tsql highlights T-SQL specific keywords", () => {
  const result = highlight("DECLARE @count INT;");

  expect(result).toContain('<span class="hljs-keyword">DECLARE</span>');
});

test("tsql highlights variables and global variables", () => {
  const result = highlight("SELECT @count, @@ROWCOUNT");

  expect(result).toContain('<span class="hljs-variable">@count</span>');
  expect(result).toContain(
    '<span class="hljs-variable language_">@@ROWCOUNT</span>',
  );
});

test("tsql highlights bracketed identifiers", () => {
  const result = highlight("SELECT [OrderId] FROM Orders");

  expect(result).toContain('<span class="hljs-title">[OrderId]</span>');
});

test("tsql highlights the GO batch separator with high relevance", () => {
  const result = highlight("SELECT 1\nGO");

  expect(result).toContain('<span class="hljs-meta">GO</span>');
});

test("tsql highlights temp table names as symbols", () => {
  const result = highlight("SELECT * FROM #TempOrders");

  expect(result).toContain('<span class="hljs-symbol">#TempOrders</span>');
});

test("tsql highlights N-prefixed strings", () => {
  const result = highlight("SELECT N'hello'");

  expect(result).toContain(
    '<span class="hljs-string">N&#x27;hello&#x27;</span>',
  );
});
