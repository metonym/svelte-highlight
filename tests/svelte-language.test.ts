import hljs from "highlight.js/lib/core";
import html from "svelte-highlight/languages/html";
import svelte from "../src/languages/svelte";

const embeddedBlocksSnippet = `<script>
  let count = 0;
</script>

<style>
  button { color: red; }
</style>

<button>{count}</button>`;

const markupSnippet = `<svelte:head>
  <title>App</title>
</svelte:head>

{#if visible}
  <button on:click={toggle}>Click</button>
{/if}`;

const typescriptSnippet = `<script lang="ts">
  let count: number = 0;
</script>`;

const svelte5Snippet = `<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>{doubled}</button>

{#if count}
  {@render children()}
{:else if count > 10}
  <p>many</p>
{:else}
  <p>few</p>
{/if}`;

test("svelte highlights embedded JavaScript, CSS, and expressions", () => {
  hljs.registerLanguage(svelte.name, svelte.register);

  const result = hljs.highlight(embeddedBlocksSnippet, {
    language: "svelte",
  }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain("hljs-keyword");
  expect(result).toContain("language-css");
  expect(result).toContain("hljs-selector-tag");
  expect(result).toContain("language-html");
});

test("svelte highlights markup, directives, and block syntax", () => {
  hljs.registerLanguage(svelte.name, svelte.register);

  const result = hljs.highlight(markupSnippet, { language: "svelte" }).value;

  expect(result).toContain("hljs-tag");
  expect(result).toContain("hljs-variable");
  expect(result).toContain("hljs-keyword");
});

test("svelte highlights TypeScript script blocks", () => {
  hljs.registerLanguage(svelte.name, svelte.register);

  const result = hljs.highlight(typescriptSnippet, {
    language: "svelte",
  }).value;

  expect(result).toContain("language-typescript");
  expect(result).toContain("hljs-keyword");
});

test("svelte highlights runes, event attributes, and block continuations", () => {
  hljs.registerLanguage(svelte.name, svelte.register);

  const result = hljs.highlight(svelte5Snippet, { language: "svelte" }).value;

  expect(result).toContain('<span class="hljs-keyword">$state</span>');
  expect(result).toContain('<span class="hljs-keyword">$derived</span>');
  expect(result).toContain('<span class="hljs-variable">onclick</span>');
  expect(result).toContain('<span class="hljs-keyword">@render</span>');
  expect(result).toContain('<span class="hljs-keyword">:else if</span>');
  expect(result).toContain('<span class="hljs-keyword">:else</span>');
});

test("svelte does not highlight directives inside script strings", () => {
  hljs.registerLanguage(svelte.name, svelte.register);

  const snippet = `<script>
  const code = \`<button on:click={() => { console.log(0); }}>Click me</button>\`;
</script>`;

  const result = hljs.highlight(snippet, { language: "svelte" }).value;

  expect(result).not.toMatch(
    /<span class="hljs-string">[^<]*<\/span><span class="hljs-variable">on:<\/span>/,
  );
  expect(result).toContain(
    '<span class="hljs-string">`&lt;button on:click={() =&gt; { console.log(0); }}&gt;Click me&lt;/button&gt;`</span>',
  );
});

test("html alone does not highlight Svelte block syntax", () => {
  const isolated = hljs.newInstance();
  isolated.registerLanguage(html.name, html.register);

  const result = isolated.highlight(markupSnippet, { language: "html" }).value;

  expect(result).not.toContain("hljs-keyword");
});
