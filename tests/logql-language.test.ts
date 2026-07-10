import { createRegistry } from "../src/engine.js";

import logql from "../src/languages/logql";

const registry = createRegistry();

registry.register(logql.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "logql" }).value;

test("logql highlights stream selector label matchers", () => {
  const result = highlight('{job="app", env=~"prod|staging"}');

  expect(result).toContain('<span class="hljs-attr">job</span>');
  expect(result).toContain('<span class="hljs-string">&quot;app&quot;</span>');
  expect(result).toContain('<span class="hljs-attr">env</span>');
});

test("logql highlights pipeline line filters", () => {
  const result = highlight('{job="app"} |= "error" != "debug"');

  expect(result).toContain('<span class="hljs-operator">|=</span>');
  expect(result).toContain('<span class="hljs-operator">!=</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;error&quot;</span>',
  );
});

test("logql highlights parser stages", () => {
  const result = highlight('{job="app"} | json | logfmt');

  expect(result).toContain('<span class="hljs-keyword">json</span>');
  expect(result).toContain('<span class="hljs-keyword">logfmt</span>');
});

test("logql highlights line and label format stages", () => {
  const result = highlight(
    '{job="app"} | line_format "{{.message}}" | label_format level="lvl"',
  );

  expect(result).toContain('<span class="hljs-keyword">line_format</span>');
  expect(result).toContain('<span class="hljs-keyword">label_format</span>');
});

test("logql highlights unwrap and aggregation functions", () => {
  const result = highlight(
    'bottomk(3, avg_over_time({job="app"} | unwrap duration [5m]))',
  );

  expect(result).toContain('<span class="hljs-built_in">bottomk</span>');
  expect(result).toContain('<span class="hljs-built_in">avg_over_time</span>');
  expect(result).toContain('<span class="hljs-keyword">unwrap</span>');
});

test("logql highlights range aggregation functions and by grouping", () => {
  const result = highlight('sum(rate({job="app"} |= "error" [5m])) by (job)');

  expect(result).toContain('<span class="hljs-built_in">sum</span>');
  expect(result).toContain('<span class="hljs-built_in">rate</span>');
  expect(result).toContain('<span class="hljs-keyword">by</span>');
});

test("logql highlights duration literals as numbers", () => {
  const result = highlight('count_over_time({job="app"}[5m])');

  expect(result).toContain('<span class="hljs-number">[5m]</span>');
});

test("logql highlights comments", () => {
  const result = highlight('# comment line\n{job="app"}');

  expect(result).toContain('<span class="hljs-comment"># comment line</span>');
});
