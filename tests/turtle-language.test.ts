import { createRegistry } from "../src/engine.js";

import turtle from "../src/languages/turtle";

const registry = createRegistry();

registry.register(turtle.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "turtle" }).value;

test("turtle highlights @prefix with high relevance", () => {
  const result = highlight("@prefix ex: <http://example.org/> .");

  expect(result).toContain('<span class="hljs-keyword">@prefix</span>');
});

test("turtle highlights IRIs as links", () => {
  const result = highlight("<http://example.org/alice>");

  expect(result).toContain(
    '<span class="hljs-link">&lt;http://example.org/alice&gt;</span>',
  );
});

test("turtle highlights prefixed names with the prefix as type", () => {
  const result = highlight("ex:alice a ex:Person .");

  expect(result).toContain('<span class="hljs-type">ex</span>');
  expect(result).toContain('<span class="hljs-symbol">alice</span>');
  expect(result).toContain('<span class="hljs-keyword">a</span>');
});

test("turtle highlights blank nodes", () => {
  const result = highlight('_:b1 ex:name "Bob" .');

  expect(result).toContain('<span class="hljs-variable">_:b1</span>');
});

test("turtle highlights language tags and datatype suffixes", () => {
  const result = highlight('"Alice"@en, "30"^^xsd:integer');

  expect(result).toContain('<span class="hljs-meta">@en</span>');
  expect(result).toContain('<span class="hljs-type">^^xsd:integer</span>');
});

test("turtle highlights comments and terminators", () => {
  const result = highlight("# a comment\nex:a ex:b ex:c ;\n  ex:d ex:e .");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain('<span class="hljs-punctuation">;</span>');
  expect(result).toContain('<span class="hljs-punctuation">.</span>');
});
