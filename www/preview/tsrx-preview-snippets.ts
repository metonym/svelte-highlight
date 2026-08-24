export type TsrxPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const tsrxPreviewSnippets: TsrxPreviewSnippet[] = [
  {
    title: "Statement container",
    description:
      "TypeScript setup, then one JSX output, plus a scoped style block",
    code: `export function Greeting({ name }: { name?: string }) @{
  const message = name ? \`Hello, \${name}\` : "Hello, stranger";

  <>
    <div class="card">
      <p>{message}</p>
    </div>

    <style>
      .card { padding: 1rem; }
    </style>
  </>
}`,
  },
  {
    title: "Template control flow",
    description:
      "@for, @if/@else, and @empty as first-class template directives",
    code: `function UserList({ users, showBio }: Props) @{
  @for (const user of users) {
    const role = user.admin ? "Admin" : "Member";

    <div class="user-row">
      <strong>{user.name}</strong>
      <span>{role}</span>
      @if (showBio && user.bio) {
        <p>{user.bio}</p>
      } @else {
        <p>No bio</p>
      }
    </div>
  } @empty {
    <p>No users</p>
  }
}`,
  },
  {
    title: "Lazy prop destructure",
    description: "&{ ... } compiles to lazy getters for reactive reads",
    code: `function Counter(&{ count, label }: Props) @{
  <section>
    <h2>{label}</h2>
    <p>Count: {count}</p>
  </section>
}`,
  },
];
