import { createRegistry } from "../src/engine.js";

import powerquery from "../src/languages/powerquery";

const registry = createRegistry();

registry.register(powerquery.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "powerquery" }).value;

test("powerquery highlights let/in and each with higher relevance", () => {
  const result = highlight("let\n    x = 1\nin\n    each x");

  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain('<span class="hljs-keyword">in</span>');
  expect(result).toContain('<span class="hljs-keyword">each</span>');
});

test("powerquery highlights quoted identifiers with high relevance", () => {
  const result = highlight('#"Changed Type"');

  expect(result).toContain(
    '<span class="hljs-variable">#&quot;Changed Type&quot;</span>',
  );
});

test("powerquery highlights hash built-ins", () => {
  const result = highlight('#table({"a"}, {{1}})');

  expect(result).toContain('<span class="hljs-built_in">#table</span>');
});

test("powerquery highlights library functions", () => {
  const result = highlight("List.Sum(values)");

  expect(result).toContain(
    '<span class="hljs-title function_">List.Sum</span>',
  );
});

test("powerquery highlights type keywords and operators", () => {
  const result = highlight("(x as number) => x");

  expect(result).toContain('<span class="hljs-type">number</span>');
  expect(result).toContain('<span class="hljs-operator">=&gt;</span>');
});

test("powerquery highlights strings with doubled-quote escapes", () => {
  const result = highlight('"He said ""hi"""');

  expect(result).toContain('<span class="hljs-subst">&quot;&quot;</span>');
});

test("powerquery highlights try/catch, optional parameters, and ... / ??", () => {
  const result = highlight(
    "let f = (x as number, optional y as text) => try x catch (e) => e[Message], g = (...) => ..., z = a ?? 0 in f",
  );

  expect(result).toContain('<span class="hljs-keyword">catch</span>');
  expect(result).toContain('<span class="hljs-keyword">optional</span>');
  expect(result).toContain('<span class="hljs-operator">...</span>');
  expect(result).toContain('<span class="hljs-operator">??</span>');
  // A two-dot range is still two numbers, not the new `...` operator.
  expect(highlight("{1..3}")).toContain(
    '<span class="hljs-number">1.</span><span class="hljs-number">.3</span>',
  );
  expect(highlight("a[b]?")).toContain('<span class="hljs-operator">?</span>');
});
