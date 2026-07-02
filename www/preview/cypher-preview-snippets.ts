export type CypherPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const cypherPreviewSnippets: CypherPreviewSnippet[] = [
  {
    title: "Pattern match",
    description: "nodes, labels, and relationships",
    code: `MATCH (person:Person)-[:ACTED_IN]->(movie:Movie)
WHERE movie.released > 2000
RETURN person.name AS actor, movie.title AS title
ORDER BY movie.released DESC
LIMIT 10`,
  },
  {
    title: "Create and merge",
    description: "parameters and property maps",
    code: `MERGE (u:User {id: $userId})
ON CREATE SET u.created = timestamp()
CREATE (u)-[:POSTED]->(p:Post {title: "Hello", likes: 0})
RETURN u, p`,
  },
  {
    title: "Built-in functions and identifiers",
    description: "id(), coalesce(), and `backtick` identifiers",
    code: `MATCH (n:\`Weird Label\`)
RETURN id(n) AS nodeId,
       coalesce(n.\`display name\`, "unknown") AS name,
       labels(n) AS labels`,
  },
];
