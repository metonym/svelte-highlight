import markdown from "svelte-highlight/languages/markdown";
import { createRegistry, registerAll } from "../src/engine.js";
import mdx from "../src/languages/mdx";

const registry = createRegistry();

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
  registerAll(registry, mdx);

  const result = registry.highlight(importSnippet, { language: "mdx" }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain("hljs-keyword");
  expect(result).toContain('<span class="hljs-section"># </span>');
  expect(result).toContain("Hello MDX");
});

test("mdx highlights markdown headings and inline formatting", () => {
  registerAll(registry, mdx);

  const result = registry.highlight(headingSnippet, { language: "mdx" }).value;

  expect(result).toContain('<span class="hljs-section"># </span>');
  expect(result).toContain("Title");
  expect(result).toContain('<span class="hljs-strong">');
  expect(result).toContain('<span class="hljs-string">');
});

test("mdx highlights JSX and embedded JavaScript expressions", () => {
  registerAll(registry, mdx);

  const result = registry.highlight(jsxSnippet, { language: "mdx" }).value;

  expect(result).toContain("language-html");
  expect(result).toContain("hljs-tag");
  expect(result).toContain("language-javascript");
});

test("mdx does not close a JSX tag early on a > inside a brace expression", () => {
  registerAll(registry, mdx);

  const result = registry.highlight(
    "<Chart data={data} highlight={value > threshold} />",
    { language: "mdx" },
  ).value;

  // the tag name and first attribute must still render with full HTML
  // tag/attr/string styling (no regression for the common case)
  expect(result).toContain('<span class="hljs-name">Chart</span>');
  expect(result).toContain('<span class="hljs-attr">data</span>');
  expect(result).toContain('<span class="hljs-string">{data}</span>');
  // the closing "/>" must stay inside the tag, not fall outside it as
  // plain text after the tag mode ended early at the embedded ">"
  expect(result).toContain(" /&gt;</span>");
});

test("mdx highlights markdown lists", () => {
  registerAll(registry, mdx);

  const result = registry.highlight(listSnippet, { language: "mdx" }).value;

  expect(result).toContain('<span class="hljs-bullet">');
  expect(result).toContain('<span class="hljs-number">');
});

test("markdown alone does not highlight JSX tags", () => {
  const isolated = createRegistry();
  registerAll(isolated, markdown);

  const result = isolated.highlight(jsxSnippet, {
    language: "markdown",
  }).value;

  expect(result).not.toContain("language-html");
  expect(result).not.toContain("hljs-tag");
});

test("mdx highlights multi-line export statements as JavaScript", () => {
  registerAll(registry, mdx);

  const multilineExport = `export const meta = {
  title: "Kitchen sink",
  description: "MDX grammar preview",
};`;

  const result = registry.highlight(multilineExport, { language: "mdx" }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain('<span class="hljs-attr">title</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;Kitchen sink&quot;</span>',
  );
});

test("mdx does not let a semicolon-less import statement swallow the rest of the document", () => {
  registerAll(registry, mdx);

  const noSemicolonImport = `import { Chart } from "./chart"

# Hello MDX

Some content here.`;

  const result = registry.highlight(noSemicolonImport, {
    language: "mdx",
  }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain('<span class="hljs-section"># </span>');
  expect(result).toContain("Hello MDX");
  expect(result).toContain("Some content here.");

  const javascriptSpanEnd = result.indexOf(
    "</span>",
    result.indexOf("language-javascript"),
  );
  const headingIndex = result.indexOf("hljs-section");

  expect(javascriptSpanEnd).toBeLessThan(headingIndex);
});

test("mdx highlights fenced javascript and css code blocks", () => {
  registerAll(registry, mdx);

  const jsFence = [
    "```javascript",
    "const total = items.reduce((sum, item) => sum + item.value, 0);",
    "```",
  ].join("\n");

  const jsResult = registry.highlight(jsFence, { language: "mdx" }).value;

  expect(jsResult).toContain("language-javascript");
  expect(jsResult).toContain('<span class="hljs-keyword">const</span>');
  expect(jsResult).toContain("```javascript");
  expect(jsResult.endsWith("```")).toBe(true);

  const cssFence = ["```css", ".foo { color: red; }", "```"].join("\n");

  const cssResult = registry.highlight(cssFence, { language: "mdx" }).value;

  expect(cssResult).toContain("language-css");
  expect(cssResult).toContain('<span class="hljs-selector-class">.foo</span>');
});

test("mdx highlights fenced typescript and tsx code blocks", () => {
  registerAll(registry, mdx);

  const tsFence = [
    "```typescript",
    "const total: number = items.length;",
    "```",
  ].join("\n");

  const tsResult = registry.highlight(tsFence, { language: "mdx" }).value;

  expect(tsResult).toContain("language-typescript");
  expect(tsResult).toContain('<span class="hljs-keyword">const</span>');
  expect(tsResult).toContain('<span class="hljs-built_in">number</span>');

  const tsxFence = ["```tsx", "const el = <div>{value}</div>;", "```"].join(
    "\n",
  );

  const tsxResult = registry.highlight(tsxFence, { language: "mdx" }).value;

  expect(tsxResult).toContain("language-typescript");
  expect(tsxResult).toContain('<span class="hljs-keyword">const</span>');
});

test("mdx falls back to plain code styling for unsupported fence languages", () => {
  registerAll(registry, mdx);

  const bashFence = ["```bash", "echo hi", "```"].join("\n");

  const result = registry.highlight(bashFence, { language: "mdx" }).value;

  expect(result).not.toContain("language-");
  expect(result).toContain("echo hi");
});
