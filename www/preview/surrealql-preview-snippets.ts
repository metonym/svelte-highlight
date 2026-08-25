export type SurrealqlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const surrealqlPreviewSnippets: SurrealqlPreviewSnippet[] = [
  {
    title: "Define and select",
    description: "SCHEMAFULL tables, record ids, and WHERE",
    code: `DEFINE TABLE user SCHEMAFULL;
SELECT * FROM user:alice WHERE age > 18;`,
  },
  {
    title: "Create and relate",
    description: "SET fields and graph edges",
    code: `CREATE user SET name = "Ada";
RELATE user:alice->wrote->post:hello;`,
  },
  {
    title: "Live query",
    description: "comments and string predicates",
    code: `// users who wrote a post
LIVE SELECT * FROM user WHERE name = "Ada";`,
  },
];
