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
