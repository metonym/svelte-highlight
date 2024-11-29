<script lang="ts">
  import { onMount } from "svelte";
  import type { HighlightAuto } from "svelte-highlight";

  let Component: typeof HighlightAuto;
  let styles: string;

  onMount(async () => {
    Component = (await import("svelte-highlight")).HighlightAuto;
    styles = (await import("svelte-highlight/styles/atom-one-dark")).default;
  });
</script>

<svelte:head>
  {#if styles}
    {@html styles}
  {/if}
</svelte:head>

{#if Component}
  <Component langtag code={`body {\n  padding: 0;\n  color: red;\n}`} />
{/if}
