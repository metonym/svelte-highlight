import hljs from "highlight.js/lib/core";
import markdown from "svelte-highlight/languages/markdown";
import mdx from "../src/languages/mdx";

const importSnippet = `import { Chart } from "./chart";

# Hello MDX

<Chart data={points} />`;

const headingSnippet = `# Title

Some **bold** text and \`inline code\`.`;

const jsxSnippet = `<div className="card">
  {items.map((item) => (
    <p key={item.id}>{item.name}</p>
  ))}
</div>`;

const listSnippet = `- first item
- second item

1. ordered
2. list`;

test("mdx highlights import statements as JavaScript", () => {
  hljs.registerLanguage(mdx.name, mdx.register);

  const result = hljs.highlight(importSnippet, { language: "mdx" }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain("hljs-keyword");
  expect(result).toContain('<span class="hljs-section"># </span>');
  expect(result).toContain("Hello MDX");
});

test("mdx highlights markdown headings and inline formatting", () => {
  hljs.registerLanguage(mdx.name, mdx.register);

  const result = hljs.highlight(headingSnippet, { language: "mdx" }).value;

  expect(result).toContain('<span class="hljs-section"># </span>');
  expect(result).toContain("Title");
  expect(result).toContain('<span class="hljs-strong">');
  expect(result).toContain('<span class="hljs-string">');
});

test("mdx highlights JSX and embedded JavaScript expressions", () => {
  hljs.registerLanguage(mdx.name, mdx.register);

  const result = hljs.highlight(jsxSnippet, { language: "mdx" }).value;

  expect(result).toContain("language-html");
  expect(result).toContain("hljs-tag");
  expect(result).toContain("language-javascript");
});

test("mdx highlights markdown lists", () => {
  hljs.registerLanguage(mdx.name, mdx.register);

  const result = hljs.highlight(listSnippet, { language: "mdx" }).value;

  expect(result).toContain('<span class="hljs-bullet">');
  expect(result).toContain('<span class="hljs-number">');
});

test("markdown alone does not highlight JSX tags", () => {
  const isolated = hljs.newInstance();
  isolated.registerLanguage(markdown.name, markdown.register);

  const result = isolated.highlight(jsxSnippet, {
    language: "markdown",
  }).value;

  expect(result).not.toContain("language-html");
  expect(result).not.toContain("hljs-tag");
});
