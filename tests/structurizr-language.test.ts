import { createRegistry } from "../src/engine.js";

import structurizr from "../src/languages/structurizr";

const registry = createRegistry();

registry.register(structurizr.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "structurizr" }).value;

test("structurizr highlights workspace/model keywords", () => {
  const result = highlight("workspace {\n  model {\n  }\n}");

  expect(result).toContain('<span class="hljs-keyword">workspace</span>');
  expect(result).toContain('<span class="hljs-keyword">model</span>');
});

test("structurizr highlights softwareSystem with high relevance", () => {
  const result = highlight('softwareSystem = softwareSystem "Banking"');

  expect(result).toContain('<span class="hljs-keyword">softwareSystem</span>');
});

test("structurizr highlights identifiers before = as variables", () => {
  const result = highlight('customer = person "Customer"');

  expect(result).toContain('<span class="hljs-variable">customer</span>');
});

test("structurizr highlights relationship arrows as operators", () => {
  const result = highlight('customer -> softwareSystem "Uses"');

  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
});

test("structurizr highlights !identifiers with high relevance", () => {
  const result = highlight("!identifiers hierarchical");

  expect(result).toContain('<span class="hljs-meta">!identifiers</span>');
  expect(result).toContain('<span class="hljs-literal">hierarchical</span>');
});

test("structurizr highlights strings and comments", () => {
  const result = highlight('# a comment\ntitle "System Landscape"');

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;System Landscape&quot;</span>',
  );
});

test("structurizr highlights configuration scope", () => {
  const result = highlight("configuration {\n  scope landscape\n}");

  expect(result).toContain('<span class="hljs-keyword">scope</span>');
  expect(result).toContain('<span class="hljs-literal">landscape</span>');
});

test("structurizr still highlights softwareSystem", () => {
  const result = highlight('softwareSystem = softwareSystem "Banking"');

  expect(result).toContain('<span class="hljs-keyword">softwareSystem</span>');
});
