import hljs from "highlight.js/lib/core";
import promql from "../src/languages/promql";

hljs.registerLanguage(promql.name, promql.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "promql" }).value;

test("promql highlights functions and aggregators", () => {
  const result = highlight("sum(rate(x[5m]))");

  expect(result).toContain('<span class="hljs-built_in">sum</span>');
  expect(result).toContain('<span class="hljs-built_in">rate</span>');
});

test("promql highlights aggregation keywords", () => {
  const result = highlight("sum by (job) (x)");

  expect(result).toContain('<span class="hljs-keyword">by</span>');
});

test("promql highlights durations as numbers", () => {
  const result = highlight("rate(x[5m])");

  expect(result).toContain('<span class="hljs-number">5m</span>');
});

test("promql highlights label matchers", () => {
  const result = highlight('http_requests_total{code="200"}');

  expect(result).toContain('<span class="hljs-attr">code</span>');
  expect(result).toContain('<span class="hljs-string">&quot;200&quot;</span>');
});
