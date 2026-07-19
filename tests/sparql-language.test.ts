import { createRegistry } from "../src/engine.js";

import sparql from "../src/languages/sparql";

const registry = createRegistry();

registry.register(sparql.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "sparql" }).value;

test("sparql highlights query-form keywords", () => {
  const result = highlight("SELECT ?name WHERE { ?s ?p ?name }");

  expect(result).toContain('<span class="hljs-keyword">SELECT</span>');
  expect(result).toContain('<span class="hljs-keyword">WHERE</span>');
});

test("sparql keywords are case-insensitive", () => {
  const result = highlight("select ?name where { ?s ?p ?name }");

  expect(result).toContain('<span class="hljs-keyword">select</span>');
  expect(result).toContain('<span class="hljs-keyword">where</span>');
});

test("sparql highlights variables", () => {
  const result = highlight("SELECT ?name $email WHERE { ?s ?p ?name }");

  expect(result).toContain('<span class="hljs-variable">?name</span>');
  expect(result).toContain('<span class="hljs-variable">$email</span>');
});

test("sparql highlights the bare `a` rdf:type shorthand as a keyword", () => {
  const result = highlight("?person a foaf:Person");

  expect(result).toContain('<span class="hljs-keyword">a</span>');
});

test("sparql highlights IRIs and prefixed names", () => {
  const result = highlight(
    "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\nSELECT ?s WHERE { ?s a foaf:Person }",
  );

  expect(result).toContain(
    '<span class="hljs-symbol">&lt;http://xmlns.com/foaf/0.1/&gt;</span>',
  );
  expect(result).toContain('<span class="hljs-symbol">foaf:Person</span>');
});

test("sparql highlights blank nodes distinctly from prefixed names", () => {
  const result = highlight("SELECT ?x WHERE { ?x foaf:knows _:b1 }");

  expect(result).toContain('<span class="hljs-symbol">_:b1</span>');
});

test("sparql highlights built-in functions", () => {
  const result = highlight('FILTER (LANG(?name) = "en" || !BOUND(?email))');

  expect(result).toContain('<span class="hljs-built_in">LANG</span>');
  expect(result).toContain('<span class="hljs-built_in">BOUND</span>');
});

test("sparql highlights strings, comments, and numbers", () => {
  const result = highlight(
    '# a comment\nSELECT ?s WHERE { ?s ?p "value" } LIMIT 10',
  );

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;value&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-number">10</span>');
});

test("sparql highlights a property path expression", () => {
  const result = highlight("?person foaf:knows+/foaf:name ?name .");

  expect(result).toContain('<span class="hljs-symbol">foaf:knows</span>');
  expect(result).toContain('<span class="hljs-operator">+</span>');
  expect(result).toContain('<span class="hljs-operator">/</span>');
  expect(result).toContain('<span class="hljs-symbol">foaf:name</span>');
});

test("sparql highlights a lang-tagged and a datatype-tagged literal", () => {
  const result = highlight(
    '?person foaf:label "Alice"@en .\n?person foaf:age "30"^^xsd:integer .',
  );

  expect(result).toContain(
    '<span class="hljs-string">&quot;Alice&quot;</span><span class="hljs-meta">@en</span>',
  );
  expect(result).toContain('<span class="hljs-string">&quot;30&quot;</span>');
  expect(result).toContain('<span class="hljs-symbol">xsd:integer</span>');
});
