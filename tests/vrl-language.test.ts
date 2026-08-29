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
