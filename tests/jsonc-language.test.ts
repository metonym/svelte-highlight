import { createRegistry } from "../src/engine.js";

import jsonc from "../src/languages/jsonc";

const registry = createRegistry();

registry.register(jsonc.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "jsonc" }).value;

test("jsonc highlights line and block comments", () => {
  const result = highlight('{\n  // line\n  /* block */\n  "a": 1\n}');

  expect(result).toContain('<span class="hljs-comment">// line</span>');
  expect(result).toContain('<span class="hljs-comment">/* block */</span>');
});

test("jsonc highlights quoted keys as attributes", () => {
  const result = highlight('{ "name": "svelte" }');

  expect(result).toContain('<span class="hljs-attr">&quot;name&quot;</span>');
});

test("jsonc highlights string values", () => {
  const result = highlight('{ "name": "svelte" }');

  expect(result).toContain(
    '<span class="hljs-string">&quot;svelte&quot;</span>',
  );
});

test("jsonc highlights numbers", () => {
  const result = highlight('{ "count": 42, "ratio": 0.75 }');

  expect(result).toContain('<span class="hljs-number">42</span>');
  expect(result).toContain('<span class="hljs-number">0.75</span>');
});

test("jsonc highlights boolean and null literals", () => {
  const result = highlight('{ "ok": true, "no": false, "empty": null }');

  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-literal">false</span>');
  expect(result).toContain('<span class="hljs-literal">null</span>');
});
