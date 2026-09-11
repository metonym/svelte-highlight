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

test("tsql highlights MERGE clauses, window frames, and $action", () => {
  const result = highlight(
    "MERGE INTO t USING s ON t.id = s.id WHEN NOT MATCHED BY TARGET THEN INSERT (id) VALUES (s.id) OUTPUT $action INTO @log;\nSELECT SUM(x) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM t;",
  );

  expect(result).toContain('<span class="hljs-keyword">MATCHED</span>');
  expect(result).toContain('<span class="hljs-keyword">TARGET</span>');
  expect(result).toContain('<span class="hljs-keyword">UNBOUNDED</span>');
  expect(result).toContain('<span class="hljs-keyword">PRECEDING</span>');
  expect(result).toContain('<span class="hljs-variable">$action</span>');
  // The `@log` table variable next to `$action` keeps its own styling.
  expect(result).toContain('<span class="hljs-variable">@log</span>');
});

test("tsql highlights SQL Server 2022 and error-handling functions", () => {
  const result = highlight(
    "SET NOCOUNT ON; SELECT GREATEST(1, 2), DATE_BUCKET(day, 7, d), DATETRUNC(month, d), ERROR_MESSAGE(), ISJSON(j) FROM t OPTION (RECOMPILE);",
  );

  expect(result).toContain('<span class="hljs-keyword">NOCOUNT</span>');
  expect(result).toContain('<span class="hljs-built_in">GREATEST</span>');
  expect(result).toContain('<span class="hljs-built_in">DATE_BUCKET</span>');
  expect(result).toContain('<span class="hljs-built_in">DATETRUNC</span>');
  expect(result).toContain('<span class="hljs-built_in">ERROR_MESSAGE</span>');
  expect(result).toContain('<span class="hljs-built_in">ISJSON</span>');
  expect(result).toContain('<span class="hljs-keyword">RECOMPILE</span>');
  // A column that merely shares a new keyword's name in a string is untouched.
  expect(highlight("SELECT 'target' AS label")).not.toContain(
    '<span class="hljs-keyword">target</span>',
  );
});
