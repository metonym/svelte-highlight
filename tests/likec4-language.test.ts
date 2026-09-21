import { createRegistry } from "../src/engine.js";

import likec4 from "../src/languages/likec4";

const registry = createRegistry();

registry.register(likec4.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "likec4" }).value;

test("likec4 highlights specification elements and element kinds", () => {
  const result = highlight("specification {\n  element actor\n}");

  expect(result).toContain('<span class="hljs-keyword">specification</span>');
  expect(result).toContain('<span class="hljs-keyword">element</span>');
});

test("likec4 highlights assignments, labels, and relationships", () => {
  const result = highlight("customer = actor 'Customer'\nui -> api 'requests'");

  expect(result).toContain('<span class="hljs-type">actor</span>');
  expect(result).toContain(
    '<span class="hljs-string">&#x27;Customer&#x27;</span>',
  );
  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
});

test("likec4 highlights view include and exclude", () => {
  const result = highlight("view index {\n  include *\n  exclude cloud.api\n}");

  expect(result).toContain('<span class="hljs-keyword">view</span>');
  expect(result).toContain('<span class="hljs-keyword">include</span>');
  expect(result).toContain('<span class="hljs-keyword">exclude</span>');
  expect(result).toContain('<span class="hljs-literal">*</span>');
});

test("likec4 highlights comments and tags", () => {
  const result = highlight("// landscape\ncustomer #external");

  expect(result).toContain('<span class="hljs-comment">// landscape</span>');
  expect(result).toContain('<span class="hljs-meta">#external</span>');
});

test("likec4 does not style a Structurizr softwareSystem declaration", () => {
  const result = highlight("softwareSystem = softwareSystem 'API'");

  expect(result).not.toContain("hljs-keyword");
  expect(result).toContain('<span class="hljs-type">softwareSystem</span>');
});
