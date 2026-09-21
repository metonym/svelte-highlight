export type OpenfgaPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const openfgaPreviewSnippets: OpenfgaPreviewSnippet[] = [
  {
    title: "A document-sharing model",
    description: "owners, editors, and viewers, with owner implying access",
    code: `model
  schema 1.1

type user

type document
  relations
    define owner: [user]
    define editor: [user] or owner
    define viewer: [user] or editor
`,
  },
  {
    title: "An organization with team-based access",
    description: "relations resolved through a related object with from",
    code: `model
  schema 1.1

type user

type team
  relations
    define member: [user]

type project
  relations
    define team: [team]
    define viewer: [user] or member from team
`,
  },
  {
    title: "Typed wildcards and an exclusion rule",
    description: "a public viewer relation with an explicit blocked list",
    code: `model
  schema 1.1

type user

type document
  relations
    define blocked: [user]
    define viewer: [user, user:*] but not blocked
`,
  },
];
