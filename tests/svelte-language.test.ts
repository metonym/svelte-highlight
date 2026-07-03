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

const moduleTypescriptSnippet = `<script lang="ts" context="module">
  export const x: number = 1;
</script>`;

const runeSuffixSnippet = `<script>
  $effect.pre(() => {});
  $effect.tracking();
  $effect.pending();
  $effect.root(() => {});
  $props.id();
  $inspect.trace();
</script>`;

const storeSubscriptionSnippet = `<script>
  $count += 1;
</script>

<p>{$count} {$user.name}</p>`;

const langTypescriptSnippet = `<script lang="typescript">
  let count: number = 0;
</script>`;

const declarationTagsSnippet = `<script lang="ts">
  type Box = { width: number; height: number };

  let boxes: Box[] = [
    { width: 3, height: 4 },
    { width: 5, height: 7 },
  ];
</script>

{#each boxes as box}
  {const area = box.width * box.height}
  {let label: number = $state(\`\${area} square pixels\`)}
  {const doubled: string = area * 2}

  <p>{doubled === 1} {label === "large"}</p>
  <div>
    {const area = "nested"}
    {area}
  </div>
{/each}`;

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

test("svelte highlights module TypeScript script blocks", () => {
  hljs.registerLanguage(svelte.name, svelte.register);

  const result = hljs.highlight(moduleTypescriptSnippet, {
    language: "svelte",
  }).value;

  expect(result).toContain("language-typescript");
  expect(result).toContain('<span class="hljs-built_in">number</span>');
});

test('svelte highlights script blocks with lang="typescript"', () => {
  hljs.registerLanguage(svelte.name, svelte.register);

  const result = hljs.highlight(langTypescriptSnippet, {
    language: "svelte",
  }).value;

  expect(result).toContain("language-typescript");
  expect(result).toContain('<span class="hljs-built_in">number</span>');
});

test("svelte highlights declaration tags with TypeScript in markup", () => {
  hljs.registerLanguage(svelte.name, svelte.register);

  const result = hljs.highlight(declarationTagsSnippet, {
    language: "svelte",
  }).value;

  expect(result).toContain("language-typescript");
  expect(result).toContain('<span class="hljs-keyword">const</span>');
  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain('<span class="hljs-keyword">$state</span>');
  expect(result).toContain('<span class="hljs-built_in">number</span>');
  expect(result).toContain('<span class="hljs-built_in">string</span>');
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

test("svelte highlights dotted rune suffixes as a single keyword", () => {
  hljs.registerLanguage(svelte.name, svelte.register);

  const result = hljs.highlight(runeSuffixSnippet, {
    language: "svelte",
  }).value;

  expect(result).toContain('<span class="hljs-keyword">$effect.pre</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">$effect.tracking</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">$effect.pending</span>');
  expect(result).toContain('<span class="hljs-keyword">$effect.root</span>');
  expect(result).toContain('<span class="hljs-keyword">$props.id</span>');
  expect(result).toContain('<span class="hljs-keyword">$inspect.trace</span>');
});

test("svelte highlights bare $store subscriptions without parens", () => {
  hljs.registerLanguage(svelte.name, svelte.register);

  const result = hljs.highlight(storeSubscriptionSnippet, {
    language: "svelte",
  }).value;

  expect(result).toContain('<span class="hljs-variable">$count</span>');
  expect(result).toContain('<span class="hljs-variable">$user</span>');
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
