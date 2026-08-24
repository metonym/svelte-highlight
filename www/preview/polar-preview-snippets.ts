export type PolarPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const polarPreviewSnippets: PolarPreviewSnippet[] = [
  {
    title: "Allow rule",
    description: "typed actors and has_permission",
    code: `allow(actor: User, "read", resource: Document) if
  has_permission(actor, "read", resource);`,
  },
  {
    title: "Resource block",
    description: "permissions and nested relations",
    code: `resource Repository {
  permissions = ["read", "push"];
  relations = { parent: Organization };
  "read" if "member";
}`,
  },
  {
    title: "Actor and comments",
    description: "hash comments and actor blocks",
    code: `# who can act
actor User {}

allow(user: User, "read", repo: Repository) if
  has_role(user, "member", repo);`,
  },
];
