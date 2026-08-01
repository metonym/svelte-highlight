import { createRegistry } from "../src/engine.js";

import flux from "../src/languages/flux";

const registry = createRegistry();

registry.register(flux.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "flux" }).value;

test("flux highlights the pipe-forward operator and built-in functions", () => {
  const result = highlight(
    'from(bucket: "example-bucket") |> range(start: -1h) |> filter(fn: (r) => r._field == "usage")',
  );

  expect(result).toContain('<span class="hljs-operator">|&gt;</span>');
  expect(result).toContain(
    '<span class="hljs-title function_ invoke__">from</span>',
  );
  expect(result).toContain(
    '<span class="hljs-title function_ invoke__">range</span>',
  );
  expect(result).toContain(
    '<span class="hljs-title function_ invoke__">filter</span>',
  );
});

test("flux highlights duration literals", () => {
  const result = highlight("range(start: -1h, stop: 30m)");

  expect(result).toContain('<span class="hljs-number">-1h</span>');
  expect(result).toContain('<span class="hljs-number">30m</span>');
});

test("flux highlights keywords and boolean literals", () => {
  const result = highlight(
    'import "strings"\n\noption v = {fn: (a, b) => a and b}',
  );

  expect(result).toContain('<span class="hljs-keyword">import</span>');
  expect(result).toContain('<span class="hljs-keyword">option</span>');
  expect(result).toContain('<span class="hljs-keyword">and</span>');
});

test("flux highlights string interpolation", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
  const result = highlight('name = "cpu"\nmsg = "measurement: ${name}"');

  expect(result).toContain('<span class="hljs-subst">${');
});

test("flux highlights line comments", () => {
  const result = highlight('// filter by measurement\nfrom(bucket: "b")');

  expect(result).toContain(
    '<span class="hljs-comment">// filter by measurement</span>',
  );
});

test("flux highlights lambda arrows", () => {
  const result = highlight("filter(fn: (r) => r._value > 0)");

  expect(result).toContain('<span class="hljs-operator">=&gt;</span>');
});
