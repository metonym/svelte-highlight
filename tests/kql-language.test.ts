import { createRegistry } from "../src/engine.js";

import kql from "../src/languages/kql";

const registry = createRegistry();

registry.register(kql.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "kql" }).value;

test("kql highlights tabular operators and the pipe", () => {
  const result = highlight(
    "SecurityEvent | where EventID == 4624 | summarize count() by Account",
  );

  expect(result).toContain('<span class="hljs-operator">|</span>');
  expect(result).toContain('<span class="hljs-keyword">where</span>');
  expect(result).toContain('<span class="hljs-keyword">summarize</span>');
  expect(result).toContain('<span class="hljs-keyword">by</span>');
});

test("kql highlights aggregation and scalar functions", () => {
  const result = highlight(
    "SigninLogs | where TimeGenerated > ago(1d) | summarize FailedCount = count() by bin(TimeGenerated, 1h)",
  );

  expect(result).toContain('<span class="hljs-built_in">ago</span>');
  expect(result).toContain('<span class="hljs-built_in">count</span>');
  expect(result).toContain('<span class="hljs-built_in">bin</span>');
});

test("kql highlights string operators", () => {
  const result = highlight('StormEvents | where State has "california"');

  expect(result).toContain('<span class="hljs-operator">has</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;california&quot;</span>',
  );
});

test("kql highlights negated string operators", () => {
  const result = highlight('Event | where Source !contains "test"');

  expect(result).toContain('<span class="hljs-operator">contains</span>');
});

test("kql highlights single and verbatim string literals", () => {
  const singleQuoted = highlight("Event | where EventLog == 'Application'");
  const verbatim = highlight('print x = @"C:\\path\\to\\file"');

  expect(singleQuoted).toContain(
    '<span class="hljs-string">&#x27;Application&#x27;</span>',
  );
  expect(verbatim).toContain(
    '<span class="hljs-string">@&quot;C:\\path\\to\\file&quot;</span>',
  );
});

test("kql highlights timespan literals", () => {
  const result = highlight(
    "Table | where Timestamp between (ago(7d) .. now())",
  );

  expect(result).toContain('<span class="hljs-number">7d</span>');
  expect(result).toContain('<span class="hljs-operator">between</span>');
});

test("kql highlights line comments", () => {
  const result = highlight(
    "Event | where EventLog == 'Application' // inline comment",
  );

  expect(result).toContain(
    '<span class="hljs-comment">// inline comment</span>',
  );
});

test("kql highlights hyphenated tabular operators", () => {
  const result = highlight("T | mv-expand Tags");

  expect(result).toContain('<span class="hljs-keyword">mv-expand</span>');
});

test("kql highlights dotted hint keywords", () => {
  const result = highlight("T | join hint.strategy=broadcast U");

  expect(result).toContain('<span class="hljs-keyword">hint.strategy</span>');
});

test("kql highlights let statements and variables", () => {
  const result = highlight(
    "let threshold = 5;\nPerf | where CounterValue > threshold",
  );

  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain('<span class="hljs-variable">threshold</span>');
});
