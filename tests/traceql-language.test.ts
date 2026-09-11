import { createRegistry } from "../src/engine.js";

import traceql from "../src/languages/traceql";

const registry = createRegistry();

registry.register(traceql.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "traceql" }).value;

test("traceql highlights spanset filters and attributes", () => {
  const result = highlight(
    `{ resource.service.name = "api" && status = error }`,
  );

  expect(result).toContain(
    '<span class="hljs-attr">resource.service.name</span>',
  );
  expect(result).toContain('<span class="hljs-operator">&amp;&amp;</span>');
  expect(result).toContain('<span class="hljs-literal">error</span>');
});

test("traceql highlights structural operators and pipelines", () => {
  const result = highlight(
    `{ span.http.status_code >= 500 } >> { name = "SQL SELECT" } | count()`,
  );

  expect(result).toContain(
    '<span class="hljs-attr">span.http.status_code</span>',
  );
  expect(result).toContain('<span class="hljs-operator">&gt;&gt;</span>');
  expect(result).toContain('<span class="hljs-operator">|</span>');
  expect(result).toContain('<span class="hljs-built_in">count</span>');
});

test("traceql highlights comments and durations", () => {
  const result = highlight("# slow traces\n{ duration > 5s }");

  expect(result).toContain('<span class="hljs-comment"># slow traces</span>');
  expect(result).toContain('<span class="hljs-number">5s</span>');
});

test("traceql highlights scoped intrinsics and unscoped attributes", () => {
  const result = highlight(
    '{ span:duration > 2s && trace:rootName = "a" && event:name = "exception" && .http.method = "GET" && parent.name = "p" }',
  );

  expect(result).toContain('<span class="hljs-attr">span:duration</span>');
  expect(result).toContain('<span class="hljs-attr">trace:rootName</span>');
  expect(result).toContain('<span class="hljs-attr">event:name</span>');
  expect(result).toContain('<span class="hljs-attr">.http.method</span>');
  expect(result).toContain('<span class="hljs-attr">parent.name</span>');
});

test("traceql highlights negated, union, and sibling structural operators", () => {
  const result = highlight(
    "{ .a = 1 } !>> { .b = 2 } &< { .c = 3 } ~ { !(span.d = 4) }",
  );

  expect(result).toContain('<span class="hljs-operator">!&gt;&gt;</span>');
  expect(result).toContain('<span class="hljs-operator">&amp;&lt;</span>');
  expect(result).toContain('<span class="hljs-operator">~</span> {');
  expect(result).toContain('!(<span class="hljs-attr">span.d</span>');
});

test("traceql highlights span kinds, query hints, and metrics functions", () => {
  const result = highlight(
    "{ kind = server } | histogram_over_time(duration) | topk(5) with (most_recent=true)",
  );

  expect(result).toContain('<span class="hljs-literal">server</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">histogram_over_time</span>',
  );
  expect(result).toContain('<span class="hljs-built_in">topk</span>');
  expect(result).toContain('<span class="hljs-keyword">with</span>');
});

test("traceql highlights compound durations and leading-dot quantiles", () => {
  const result = highlight(
    "{ duration > 1m30s } | quantile_over_time(duration, .99)",
  );

  expect(result).toContain('<span class="hljs-number">1m30s</span>');
  expect(result).toContain('<span class="hljs-number">.99</span>');
});
