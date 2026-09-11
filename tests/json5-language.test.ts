import { createRegistry } from "../src/engine.js";

import json5 from "../src/languages/json5";

const registry = createRegistry();

registry.register(json5.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "json5" }).value;

test("json5 highlights line and block comments", () => {
  const result = highlight("{\n  // line\n  /* block */\n}");

  expect(result).toContain('<span class="hljs-comment">// line</span>');
  expect(result).toContain('<span class="hljs-comment">/* block */</span>');
});

test("json5 highlights unquoted and quoted keys as attributes", () => {
  const result = highlight("{ unquoted: 1, 'single': 2, \"double\": 3 }");

  expect(result).toContain('<span class="hljs-attr">unquoted</span>');
  expect(result).toContain("hljs-attr");
});

test("json5 highlights single- and double-quoted strings", () => {
  const result = highlight("{ a: 'raw', b: \"value\" }");

  expect(result).toContain('<span class="hljs-string">&#x27;raw&#x27;</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;value&quot;</span>',
  );
});

test("json5 highlights hex, float, and signed numbers", () => {
  const result = highlight("{ a: 0xFF, b: -3.14, c: .5, d: +42 }");

  expect(result).toContain('<span class="hljs-number">0xFF</span>');
  expect(result).toContain("hljs-number");
});

test("json5 highlights Infinity, NaN, and boolean literals", () => {
  const result = highlight("{ a: Infinity, b: NaN, c: true, d: null }");

  expect(result).toContain('<span class="hljs-number">Infinity</span>');
  expect(result).toContain('<span class="hljs-number">NaN</span>');
  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-literal">null</span>');
});

test("json5 highlights numbers with a trailing decimal point", () => {
  const result = highlight("{ a: 8675309., b: .5, c: -1., d: 1.5e3 }");

  expect(result).toContain('<span class="hljs-number">8675309.</span>');
  expect(result).toContain('<span class="hljs-number">.5</span>');
  expect(result).toContain('<span class="hljs-number">-1.</span>');
  expect(result).toContain('<span class="hljs-number">1.5e3</span>');
});

test("json5 does not style digits glued to an identifier as a number", () => {
  const result = highlight("{ a: 12abc, b: 'x1.' }");

  expect(result).not.toContain('<span class="hljs-number">12</span>');
  expect(result).toContain('<span class="hljs-string">&#x27;x1.&#x27;</span>');
});
