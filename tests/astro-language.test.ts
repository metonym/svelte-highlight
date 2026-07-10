import html from "svelte-highlight/languages/html";
import { createRegistry, registerAll } from "../src/engine.js";
import astro from "../src/languages/astro";

const registry = createRegistry();

const frontmatterSnippet = `---
export const title = "Hello";
---

<div>{title}</div>`;

const templateSnippet = `<div class="card">
  <h1>{title}</h1>
  <Counter client:load />
</div>`;

const styleSnippet = `<style is:global>
  .card { color: red; }
</style>

<p>Hi</p>`;

const globalWildcardSnippet = `<style is:global>
  * {
    margin: 0;
  }
</style>`;

const directiveAttrsSnippet = `<div set:html={html} />
<span class:list={["badge", { active }]}>Status</span>`;

const strayFenceSnippet = `---
export const title = "Hello";
---

<div>{title}</div>

---

<p>after the hr</p>`;

test("astro highlights frontmatter as TypeScript", () => {
  registerAll(registry, astro);

  const result = registry.highlight(frontmatterSnippet, {
    language: "astro",
  }).value;

  expect(result).toContain("language-typescript");
  expect(result).toContain("hljs-keyword");
  expect(result).not.toContain(
    'hljs-comment"><span class="language-typescript"',
  );
  expect(result).toContain("language-html");
  expect(result).toContain("hljs-tag");
});

test("astro highlights template markup and expressions", () => {
  registerAll(registry, astro);

  const result = registry.highlight(templateSnippet, {
    language: "astro",
  }).value;

  expect(result).toContain("language-html");
  expect(result).toContain("hljs-tag");
  expect(result).toContain("language-javascript");
  expect(result).toContain('<span class="hljs-attr">client:load</span>');
  expect(result).not.toContain(
    '<span class="hljs-variable">client:load</span>',
  );
});

test("astro highlights style blocks as CSS", () => {
  registerAll(registry, astro);

  const result = registry.highlight(styleSnippet, { language: "astro" }).value;

  expect(result).toContain("language-css");
  expect(result).toContain("hljs-selector-class");
  expect(result).toContain("language-html");
});

test("astro highlights is:global and CSS universal selector", () => {
  registerAll(registry, astro);

  const result = registry.highlight(globalWildcardSnippet, {
    language: "astro",
  }).value;

  expect(result).toContain('<span class="hljs-attr">is:global</span>');
  expect(result).toContain("hljs-attribute");
  expect(result).toContain("language-css");
  expect(result).toContain(
    '<span class="hljs-tag">&lt;/<span class="hljs-name">style</span>&gt;</span>',
  );
});

test("astro highlights colon attributes inside tags", () => {
  registerAll(registry, astro);

  const result = registry.highlight(directiveAttrsSnippet, {
    language: "astro",
  }).value;

  expect(result).toContain('<span class="hljs-attr">set:html</span>');
  expect(result).toContain('<span class="hljs-attr">class:list</span>');
  expect(result).not.toContain('<span class="hljs-variable">set:html</span>');
  expect(result).not.toContain('hljs-tag">]}&gt;');
  expect(result).toContain('language-javascript">{[<span class="hljs-string">');
});

test("astro does not open a new frontmatter region at a stray --- mid-document", () => {
  registerAll(registry, astro);

  const result = registry.highlight(strayFenceSnippet, {
    language: "astro",
  }).value;

  const typescriptRegionCount = (result.match(/language-typescript/g) ?? [])
    .length;

  expect(typescriptRegionCount).toBe(1);
  expect(result).toContain("after the hr");
});

test("html alone does not highlight Astro frontmatter or client directives", () => {
  const isolated = createRegistry();
  registerAll(isolated, html);

  const result = isolated.highlight(frontmatterSnippet, {
    language: "html",
  }).value;

  expect(result).not.toContain("language-typescript");
});
