export type TurtlePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const turtlePreviewSnippets: TurtlePreviewSnippet[] = [
  {
    title: "A basic graph",
    description: "@prefix, prefixed names, and the a shorthand",
    code: `@prefix ex: <http://example.org/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

ex:alice a ex:Person ;
  ex:name "Alice"@en ;
  ex:age "30"^^xsd:integer ;
  ex:knows _:b1 .

_:b1 ex:name "Bob" .
`,
  },
  {
    title: "Blank node property lists",
    description: "nested [ ... ] blank nodes and collections",
    code: `@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:alice foaf:knows [
  a foaf:Person ;
  foaf:name "Carol"
] .

ex:alice ex:favoriteColors ( "red" "green" "blue" ) .
`,
  },
  {
    title: "Multiple graphs (TriG)",
    description: "GRAPH blocks and base IRIs",
    code: `@base <http://example.org/> .
PREFIX ex: <http://example.org/>

GRAPH ex:graph1 {
  ex:alice ex:knows ex:bob .
}
`,
  },
];
