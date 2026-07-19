export type MdxPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const mdxPreviewSnippets: MdxPreviewSnippet[] = [
  {
    title: "Import and export statements",
    description: "ESM frontmatter at the top of MDX files",
    code: `import { Chart } from "./chart";
import type { Point } from "./types";

export const title = "Dashboard";

# {title}`,
  },
  {
    title: "Markdown headings and formatting",
    description: "Headings, bold, inline code, and lists",
    code: `# Getting started

Some **bold** text and \`inline code\`.

- first item
- second item

1. ordered
2. list`,
  },
  {
    title: "JSX components",
    description: "Embedded HTML/JSX with props",
    code: `<Card title="Hello">
  <p>Welcome to the docs.</p>
</Card>

<Alert variant="warning">
  Remember to save your work.
</Alert>`,
  },
  {
    title: "JavaScript expressions",
    description: "Inline {expressions} in prose and JSX",
    code: `# Stats

The total is {items.length} items.

<ul>
  {items.map((item) => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>`,
  },
  {
    title: "Comparison inside a JSX attribute",
    description: "A > operator inside a {...} attribute expression",
    code: "<Chart data={data} highlight={value > threshold} />",
  },
  {
    title: "Fenced code block",
    description: "Triple-backtick code fences in MDX",
    code: `# Example

\`\`\`typescript
type User = { id: string; name: string };

export function greet(user: User): string {
  return \`Hello, \${user.name}\`;
}
\`\`\``,
  },
  {
    title: "Import without a trailing semicolon",
    description: "ASI-style imports no longer swallow the rest of the file",
    code: `import Chart from "./chart"
export const title = "Dashboard"

# {title}

This heading and paragraph render normally instead of being
absorbed into the import statement above.`,
  },
];
