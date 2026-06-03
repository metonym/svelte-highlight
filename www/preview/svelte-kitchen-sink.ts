export const svelteKitchenSink = `<script lang="ts" module>
  export const APP_VERSION: string = "1.0.0";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { tweened } from "svelte/motion";
  import { writable } from "svelte/store";

  type Item = { id: number; label: string };

  interface Props {
    title: string;
    items?: Item[];
    children?: Snippet;
    header?: Snippet<[string]>;
  }

  let { title, items = [], children, header }: Props = $props();

  let count = $state(0);
  let name = $bindable("");
  let legacyCount = 0;
  let doubled = $derived(count * 2);
  let trustedMarkup = "<strong>safe html</strong>";

  const total = $derived.by(() => items.length + count);
  const store = writable(0);
  const tweenedValue = tweened(0);

  $effect(() => {
    console.log("count", count);
  });

  $effect.pre(() => {
    document.title = title;
  });

  $inspect(count, doubled);

  function increment() {
    count += 1;
  }

  function focus(node: HTMLInputElement) {
    node.focus();
  }

  async function loadItems(): Promise<Item[]> {
    return items;
  }
</script>

<svelte:options runes={true} />

<svelte:head>
  <title>{title}</title>
  <!-- App metadata -->
</svelte:head>

<svelte:window onkeydown={(e) => e.key === "Escape" && (count = 0)} />

<style>
  .box {
    padding: 1rem;
    border: 1px solid #ccc;
  }

  .active {
    font-weight: bold;
  }

  :global(body) {
    margin: 0;
  }
</style>

{@debug count, name, doubled}

{#snippet row(item: Item, index: number)}
  <li>{index + 1}. {item.label}</li>
{/snippet}

{#if header}
  {@render header(title)}
{/if}

<!-- Legacy directives alongside Svelte 5 -->
<button
  on:click={() => (legacyCount += 1)}
  onclick={increment}
  onkeydown={(e) => e.key === "Enter" && increment()}
>
  Legacy: {legacyCount} · Runes: {count} · {doubled}
</button>

<input bind:value={name} placeholder="Name" />
<div
  class:active={count > 0}
  class="box"
  style:color={count > 5 ? "crimson" : "inherit"}
  style:opacity={count / 10}
>
  {name || "Anonymous"} · total {total}
</div>
<input use:focus />

{#if count === 0}
  <p transition:fade>Start counting</p>
{:else if count < 5}
  <p in:fly={{ y: 20, duration: 300 }} out:fade>Getting started</p>
{:else}
  <p animate:fade>{count} clicks</p>
{/if}

{#each items as item, index (item.id)}
  {@render row(item, index)}
{:else}
  <p>No items yet</p>
{/each}

{#key count}
  {const badge: string = $state(\`v\${count}\`)}
  {let suffix: number = $derived(badge.length)}
  <span>{badge} ({suffix})</span>
{/key}

{#await loadItems()}
  <p>Loading...</p>
{:then loaded}
  <ul>
    {#each loaded as item (item.id)}
      <li>{item.label}</li>
    {/each}
  </ul>
{:catch error}
  <p class="error">{error.message}</p>
{/await}

<p>Store: {$store}</p>
<p>Tweened: {$tweenedValue}</p>

{#if children}
  {@render children()}
{/if}

<Widget {items} let:widget>
  <span>{widget.label}</span>
</Widget>

{@html trustedMarkup}

<a href="/about">About</a>`;
