import { createRegistry } from "../src/engine.js";

import cypher from "../src/languages/cypher";

const registry = createRegistry();

registry.register(cypher.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "cypher" }).value;

test("cypher highlights clause keywords", () => {
  const result = highlight("MATCH (n) RETURN n");

  expect(result).toContain('<span class="hljs-keyword">MATCH</span>');
  expect(result).toContain('<span class="hljs-keyword">RETURN</span>');
});

test("cypher is case-insensitive for keywords", () => {
  const result = highlight("match (n) where n.x = 1 return n");

  expect(result).toContain('<span class="hljs-keyword">match</span>');
  expect(result).toContain('<span class="hljs-keyword">where</span>');
});

test("cypher highlights node labels", () => {
  const result = highlight("MATCH (n:Person) RETURN n");

  expect(result).toContain('<span class="hljs-type">:Person</span>');
});

test("cypher highlights chained multi-labels and relationship types", () => {
  const result = highlight("MATCH (n:Person:Employee)-[:KNOWS]->(m) RETURN n");

  expect(result).toContain('<span class="hljs-type">:Person</span>');
  expect(result).toContain('<span class="hljs-type">:Employee</span>');
  expect(result).toContain('<span class="hljs-type">:KNOWS</span>');
});

test("cypher does not mistake a map-literal identifier value for a label", () => {
  const result = highlight("RETURN {name: n.name, age: 30}");

  expect(result).toContain('<span class="hljs-attr">name</span>');
  expect(result).toContain('<span class="hljs-attr">age</span>');
  expect(result).not.toContain('<span class="hljs-type">:n</span>');
});

test("cypher highlights parameters and strings", () => {
  const result = highlight('MATCH (n) WHERE n.name = $name RETURN "ok"');

  expect(result).toContain('<span class="hljs-variable">$name</span>');
  expect(result).toContain('<span class="hljs-string">&quot;ok&quot;</span>');
});

test("cypher highlights built-in function calls", () => {
  const result = highlight(
    "MATCH (n) RETURN id(n), labels(n), coalesce(n.a, n.b)",
  );

  expect(result).toContain('<span class="hljs-built_in">id</span>');
  expect(result).toContain('<span class="hljs-built_in">labels</span>');
  expect(result).toContain('<span class="hljs-built_in">coalesce</span>');
});

test("cypher highlights backtick-quoted identifiers", () => {
  const result = highlight("MATCH (n:`weird label`) RETURN n.`property name`");

  expect(result).toContain('<span class="hljs-string">`weird label`</span>');
  expect(result).toContain('<span class="hljs-string">`property name`</span>');
});

test("cypher keeps highlighting inside CALL subquery bodies", () => {
  const result = highlight(
    "CALL (f) {\n  MATCH (f)-[:LIKES]->(m:Movie)\n  RETURN m.title AS title\n}\nCALL {\n  WITH f\n  RETURN count(f) AS c\n}",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">MATCH</span> (f)-[<span class="hljs-type">:LIKES</span>]-&gt;(m<span class="hljs-type">:Movie</span>)',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">RETURN</span> m.title <span class="hljs-keyword">AS</span> title',
  );
  expect(result).toContain('<span class="hljs-keyword">WITH</span> f');
  expect(result).not.toContain('<span class="hljs-attr">m</span>');
});

test("cypher highlights subquery expressions and still styles map literals", () => {
  const result = highlight(
    "RETURN EXISTS { (n)--() }, COUNT { (n)-->() }, { name: n.name, age: 30 }, count(n) AS count",
  );

  expect(result).toContain('<span class="hljs-keyword">EXISTS</span> {');
  expect(result).toContain('<span class="hljs-keyword">COUNT</span> {');
  expect(result).toContain('<span class="hljs-attr">name</span>');
  expect(result).toContain('<span class="hljs-attr">age</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">count</span>(n) <span class="hljs-keyword">AS</span> count',
  );
});

test("cypher does not open a map literal on a path quantifier", () => {
  const result = highlight("MATCH ((a)-[:R]->(b)){1,3} RETURN a");

  expect(result).toContain(
    '{<span class="hljs-number">1</span>,<span class="hljs-number">3</span>} <span class="hljs-keyword">RETURN</span>',
  );
});

test("cypher highlights hex and octal numbers", () => {
  const result = highlight("RETURN 0x1F, 0o17, 2.5");

  expect(result).toContain('<span class="hljs-number">0x1F</span>');
  expect(result).toContain('<span class="hljs-number">0o17</span>');
  expect(result).toContain('<span class="hljs-number">2.5</span>');
});

test("cypher highlights Neo4j 5 and Cypher 25 clause keywords", () => {
  const result = highlight(
    "USE neo4j\nINSERT (n:Item)\nNODETACH DELETE n\nLET total = 1\nFILTER total > 0\nMATCH p = SHORTEST 2 (a)-->(b)\nUNION ALL\nLOAD CSV WITH HEADERS FROM 'file:///x.csv' AS row\nFINISH",
  );

  for (const keyword of [
    "USE",
    "INSERT",
    "NODETACH",
    "LET",
    "FILTER",
    "SHORTEST",
    "ALL",
    "HEADERS",
    "FINISH",
  ]) {
    expect(result).toContain(`<span class="hljs-keyword">${keyword}</span>`);
  }
});

test("cypher does not style a property named like a keyword", () => {
  const result = highlight("RETURN n.desc, n.limit, n.in, n.count");

  expect(result).toContain(
    '<span class="hljs-keyword">RETURN</span> n.desc, n.limit, n.in, n.count',
  );
  expect(result).not.toContain('<span class="hljs-keyword">desc</span>');
  expect(result).not.toContain('<span class="hljs-operator">in</span>');
});
