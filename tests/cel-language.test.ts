import { createRegistry } from "../src/engine.js";

import cel from "../src/languages/cel";

const registry = createRegistry();

registry.register(cel.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "cel" }).value;

test("cel highlights the has macro as a built-in", () => {
  const result = highlight("has(request.auth)");

  expect(result).toContain('<span class="hljs-built_in">has</span>');
});

test("cel highlights literals and the in keyword", () => {
  const result = highlight('"admin" in roles && active == true');

  expect(result).toContain('<span class="hljs-keyword">in</span>');
  expect(result).toContain('<span class="hljs-literal">true</span>');
});

test("cel highlights field access", () => {
  const result = highlight("resource.owner");

  expect(result).toContain('<span class="hljs-property">.owner</span>');
});

test("cel highlights line comments and numbers", () => {
  const result = highlight("// check quota\nquota > 100u");

  expect(result).toContain('<span class="hljs-comment">// check quota</span>');
  expect(result).toContain('<span class="hljs-number">100u</span>');
});

test("cel highlights case-insensitive raw and bytes string prefixes", () => {
  const result = highlight(`R"path" B'bytes' bR"both"`);

  expect(result).toContain(
    '<span class="hljs-string">R&quot;path&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">B&#x27;bytes&#x27;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">bR&quot;both&quot;</span>',
  );
});

test("cel highlights optional field access and leaves list literals plain", () => {
  const result = highlight("request.?auth && items[0] == [1, 2]");

  expect(result).toContain('<span class="hljs-property">.?auth</span>');
  expect(result).not.toContain('<span class="hljs-property">[0]</span>');
  expect(result).not.toContain('<span class="hljs-property">[1, 2]</span>');
});
