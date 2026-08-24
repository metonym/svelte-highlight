import { createRegistry } from "../src/engine.js";

import esql from "../src/languages/esql";

const registry = createRegistry();

registry.register(esql.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "esql" }).value;

test("esql highlights pipeline commands", () => {
  const result = highlight(
    `FROM logs-*
| WHERE status >= 500
| STATS count = COUNT(*) BY host
| SORT count DESC
| LIMIT 10
`,
  );

  expect(result).toContain('<span class="hljs-keyword">FROM</span>');
  expect(result).toContain('<span class="hljs-keyword">WHERE</span>');
  expect(result).toContain('<span class="hljs-keyword">STATS</span>');
  expect(result).toContain('<span class="hljs-built_in">COUNT</span>');
  expect(result).toContain('<span class="hljs-operator">|</span>');
});

test("esql is case-insensitive for keywords", () => {
  const result = highlight("from logs | where true | limit 1");

  expect(result).toContain('<span class="hljs-keyword">from</span>');
  expect(result).toContain('<span class="hljs-keyword">where</span>');
});

test("esql highlights comments and strings", () => {
  const result = highlight(
    '// errors only\nFROM logs | WHERE message == "timeout"',
  );

  expect(result).toContain('<span class="hljs-comment">// errors only</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;timeout&quot;</span>',
  );
});

test("esql highlights nested STATS aggregations", () => {
  const result = highlight(
    "FROM logs | STATS total = SUM(bytes), avg = AVG(bytes) BY host.hostname",
  );

  expect(result).toContain('<span class="hljs-built_in">SUM</span>');
  expect(result).toContain('<span class="hljs-built_in">AVG</span>');
  expect(result).toContain('<span class="hljs-keyword">BY</span>');
});
