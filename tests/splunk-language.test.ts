import { createRegistry } from "../src/engine.js";

import splunk from "../src/languages/splunk";

const registry = createRegistry();

registry.register(splunk.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "splunk" }).value;

test("splunk highlights commands as keywords", () => {
  const result = highlight("search index=web | stats count by host");

  expect(result).toContain('<span class="hljs-keyword">search</span>');
  expect(result).toContain('<span class="hljs-keyword">stats</span>');
  expect(result).toContain('<span class="hljs-keyword">by</span>');
});

test("splunk highlights the pipe operator", () => {
  const result = highlight("search foo | stats count");

  expect(result).toContain('<span class="hljs-operator">|</span>');
});

test("splunk highlights key= search terms as attr", () => {
  const result = highlight("search index=web status=500");

  expect(result).toContain('<span class="hljs-attr">index</span>');
  expect(result).toContain('<span class="hljs-attr">status</span>');
});

test("splunk highlights boolean operators and eval functions", () => {
  const result = highlight("where error_rate > 0.05 AND count(x)");

  expect(result).toContain('<span class="hljs-keyword">AND</span>');
  expect(result).toContain('<span class="hljs-built_in">count</span>');
});
