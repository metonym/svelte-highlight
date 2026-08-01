export type CqlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const cqlPreviewSnippets: CqlPreviewSnippet[] = [
  {
    title: "Creating a table",
    description: "keywords, column types, and PRIMARY KEY",
    code: `CREATE TABLE users (
    id UUID PRIMARY KEY,
    name TEXT,
    age INT,
    created_at TIMESTAMP
);`,
  },
  {
    title: "Filtering with ALLOW FILTERING",
    description: "WHERE, ALLOW FILTERING, and bind markers",
    code: `SELECT name, age
FROM users
WHERE age > ?
ALLOW FILTERING;`,
  },
  {
    title: "Insert with TTL",
    description: "USING TTL, string escaping, and built-in functions",
    code: `-- expire the row after one day
INSERT INTO users (id, name)
VALUES (uuid(), 'O''Brien')
USING TTL 86400;

SELECT count(*), writetime(name) FROM users;`,
  },
];
