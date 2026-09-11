import { createRegistry } from "../src/engine.js";

import vrl from "../src/languages/vrl";

const registry = createRegistry();

registry.register(vrl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "vrl" }).value;

test("vrl highlights fallible function calls with a built-in name and a bang operator", () => {
  const result = highlight("parse_json!(.message)");

  expect(result).toContain('<span class="hljs-built_in">parse_json</span>');
  expect(result).toContain('<span class="hljs-operator">!</span>');
});

test("vrl highlights the error-coalescing operator", () => {
  const result = highlight("to_int(.status_code) ?? 0");

  expect(result).toContain('<span class="hljs-operator">??</span>');
});

test("vrl highlights event field paths and the root reference", () => {
  const result = highlight(". = parse_json!(.message)");

  expect(result).toContain('<span class="hljs-property">.</span>');
  expect(result).toContain('<span class="hljs-property">.message</span>');
});

test("vrl highlights keywords, literals, and comments", () => {
  const result = highlight(
    "# check flag\nif exists(.error) { true } else { null }",
  );

  expect(result).toContain('<span class="hljs-comment"># check flag</span>');
  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-keyword">else</span>');
  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-literal">null</span>');
});

test("vrl highlights floats and digit separators instead of eating the decimal as a path", () => {
  const result = highlight(".n = 1.5e-2\n.n = 1_000");

  expect(result).toContain('<span class="hljs-number">1.5e-2</span>');
  expect(result).toContain('<span class="hljs-number">1_000</span>');
  expect(result).not.toContain('<span class="hljs-property">.</span>5e');
});

test("vrl highlights raw, regex, and timestamp literals and return", () => {
  const result = highlight(
    "return s'no escapes'\n.pat = r'(?P<w>\\\\w+)'\n.t = t'2024-01-02T03:04:05Z'",
  );

  expect(result).toContain('<span class="hljs-keyword">return</span>');
  expect(result).toContain(
    '<span class="hljs-string">s&#x27;no escapes&#x27;</span>',
  );
  expect(result).toContain("hljs-regexp");
  expect(result).toContain(
    '<span class="hljs-string">t&#x27;2024-01-02T03:04:05Z&#x27;</span>',
  );
});

test("vrl does not treat != as a fallible bang", () => {
  const result = highlight("err != null");

  expect(result).toContain('<span class="hljs-operator">!=</span>');
  expect(result).not.toContain('<span class="hljs-operator">!</span>=');
  expect(result).toContain('<span class="hljs-literal">null</span>');
});
