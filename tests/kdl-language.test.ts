import { createRegistry } from "../src/engine.js";

import kdl from "../src/languages/kdl";

const registry = createRegistry();

registry.register(kdl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "kdl" }).value;

test("kdl highlights node names and nested children", () => {
  const result = highlight(
    `package {
  name "svelte-highlight"
  version 1.0
}`,
  );

  expect(result).toContain('<span class="hljs-title function_">package</span>');
  expect(result).toContain('<span class="hljs-title function_">name</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;svelte-highlight&quot;</span>',
  );
});

test("kdl highlights properties and literals", () => {
  const result = highlight('server host="localhost" port=8080 enabled=#true');

  expect(result).toContain('<span class="hljs-attr">host</span>');
  expect(result).toContain('<span class="hljs-attr">port</span>');
  expect(result).toContain('<span class="hljs-literal">#true</span>');
  expect(result).toContain('<span class="hljs-number">8080</span>');
});

test("kdl highlights comments including slashdash", () => {
  const line = highlight("// a comment\nnode 1");
  const slashdash = highlight("/- skipped 1\nnode 2");

  expect(line).toContain('<span class="hljs-comment">// a comment</span>');
  expect(slashdash).toContain('<span class="hljs-comment">/- skipped 1</span>');
});

test("kdl highlights type annotations", () => {
  const result = highlight('created (date)"2024-01-01"');

  expect(result).toContain('<span class="hljs-type">(date)</span>');
});
