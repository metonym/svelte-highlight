export type SparqlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const sparqlPreviewSnippets: SparqlPreviewSnippet[] = [
  {
    title: "SELECT with FILTER",
    description: "keywords, variables, prefixed names, and built-in functions",
    code: `PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?name ?email
WHERE {
  ?person a foaf:Person ;
          foaf:name ?name .
  OPTIONAL { ?person foaf:mbox ?email }
  FILTER (LANG(?name) = "en" || !BOUND(?email))
}
ORDER BY ?name
LIMIT 10`,
  },
  {
    title: "CONSTRUCT",
    description: "building a new graph from a WHERE pattern",
    code: `PREFIX foaf: <http://xmlns.com/foaf/0.1/>

CONSTRUCT {
  ?person foaf:knows ?friend .
}
WHERE {
  ?person foaf:friendOf ?friend .
  FILTER NOT EXISTS { ?person foaf:knows ?friend }
}`,
  },
  {
    title: "Property paths and typed literals",
    description:
      "a property path expression and a lang/datatype-tagged literal",
    code: `PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?name ?age WHERE {
  ?person foaf:knows+/foaf:name ?name .
  ?person foaf:age "30"^^xsd:integer ;
          foaf:label "Alice"@en .
  FILTER (?age > 18)
}`,
  },
];
