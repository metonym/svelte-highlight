export type SveltePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const sveltePreviewSnippets: SveltePreviewSnippet[] = [
  {
    title: "TypeScript script block",
    description: '<script lang="ts"> with type annotations',
    code: `<script lang="ts">
  type Box = { width: number; height: number };

  let boxes: Box[] = [
    { width: 3, height: 4 },
    { width: 5, height: 7 },
  ];
</script>`,
  },
  {
    title: "Module TypeScript script",
    description: '<script lang="ts" context="module">',
    code: `<script lang="ts" context="module">
  export const API_URL: string = "https://example.com";
</script>`,
  },
  {
    title: 'lang="typescript"',
    description: "Alternate TypeScript lang attribute value",
    code: `<script lang="typescript">
  let count: number = 0;
</script>`,
  },
  {
    title: "Svelte 5 declaration tags",
    description: "{const} and {let} with TypeScript in markup",
    code: `<script lang="ts">
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
{/each}`,
  },
  {
    title: "Runes and block syntax",
    description: "Svelte 5 runes, @render, and :else if continuations",
    code: `<script>
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
{/if}`,
  },
  {
    title: "Legacy directives",
    description:
      "on:, bind:, class:, use:, transition:, and let: prop directives",
    code: `<script>
  let count = 0;
  let name = "";
  let visible = true;

  function increment() {
    count += 1;
  }

  function focus(node) {
    node.focus();
  }
</script>

<button on:click={increment}>Clicks: {count}</button>
<input bind:value={name} placeholder="Name" />
<div class:active={count > 0} class="box">{name || "Anonymous"}</div>
<input use:focus />
{#if visible}
  <p transition:fade>Hello, {name}!</p>
{/if}
<List {items} let:item>
  <span>{item.label}</span>
</List>`,
  },
];
