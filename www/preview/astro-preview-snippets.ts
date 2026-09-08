export type AstroPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const astroPreviewSnippets: AstroPreviewSnippet[] = [
  {
    title: "Frontmatter and template",
    description: "TypeScript frontmatter fence followed by markup",
    code: `---
import Counter from "../components/Counter.astro";

export const title = "Hello, Astro";
const items = await fetch("/api/items").then((res) => res.json());
---

<div class="card">
  <h1>{title}</h1>
  <Counter client:load count={items.length} />
</div>`,
  },
  {
    title: "Scoped styles",
    description: "a component-scoped <style> block highlighted as CSS",
    code: `---
const color = "tomato";
---

<style>
  .badge {
    color: var(--badge-color, tomato);
    border-radius: 4px;
  }
</style>

<span class="badge">New</span>`,
  },
  {
    title: "Client directives",
    description: "colon-namespaced attributes like client:load and set:html",
    code: `<div set:html={rawHtml} />
<span class:list={["badge", { active }]}>Status</span>
<Widget client:visible />`,
  },
];
