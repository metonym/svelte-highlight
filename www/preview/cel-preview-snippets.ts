export type CelPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const celPreviewSnippets: CelPreviewSnippet[] = [
  {
    title: "An authorization check",
    description: "the has macro, field access, and a ternary expression",
    code: `// admin or verified owner may edit
has(request.auth) &&
  (request.auth.role == "admin" ||
    (request.auth.uid == resource.owner && resource.verified))
? "allow"
: "deny"`,
  },
  {
    title: "Comprehension macros",
    description: "all and exists over a list",
    code: `all(items, item, item.price > 0) &&
  exists(items, item, item.category == "sale")`,
  },
  {
    title: "Type conversions and membership",
    description: "duration, timestamp, and the in operator",
    code: `timestamp("2024-01-01T00:00:00Z") + duration("24h") > request.time &&
  "admin" in request.auth.roles`,
  },
];
