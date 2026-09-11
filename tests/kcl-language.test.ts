import { createRegistry } from "../src/engine.js";

import kcl from "../src/languages/kcl";

const registry = createRegistry();

registry.register(kcl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "kcl" }).value;

test("kcl highlights schema names as class titles", () => {
  const result = highlight("schema Person:");

  expect(result).toContain('<span class="hljs-keyword">schema</span>');
  expect(result).toContain('<span class="hljs-title class_">Person</span>');
});

test("kcl highlights the check block", () => {
  const result = highlight('check:\n  age >= 0, "must be non-negative"');

  expect(result).toContain('<span class="hljs-keyword">check:</span>');
});

test("kcl highlights decorators", () => {
  const result = highlight("@deprecated\nschema Foo:");

  expect(result).toContain('<span class="hljs-meta">@deprecated</span>');
});

test("kcl highlights string interpolation", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: KCL's own ${} interpolation syntax, not a JS template literal
  const result = highlight('greeting = "Hello, ${name}"');

  // biome-ignore lint/suspicious/noTemplateCurlyInString: KCL's own ${} interpolation syntax, not a JS template literal
  expect(result).toContain('<span class="hljs-subst">${name}</span>');
});

test("kcl highlights comments and literals", () => {
  const result = highlight("# a comment\nx = True");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain('<span class="hljs-literal">True</span>');
});

test("kcl highlights SI and IEC unit suffixes on numbers", () => {
  const result = highlight("cpu = 0.5Gi\nwait = 10m\nbits = 0xFF");

  expect(result).toContain('<span class="hljs-number">0.5Gi</span>');
  expect(result).toContain('<span class="hljs-number">10m</span>');
  expect(result).toContain('<span class="hljs-number">0xFF</span>');
});

test("kcl does not treat a unit suffix as part of a following identifier", () => {
  const result = highlight("count = 3\nGi = name");

  expect(result).toContain('<span class="hljs-number">3</span>');
  expect(result).not.toContain('<span class="hljs-number">3Gi</span>');
});
