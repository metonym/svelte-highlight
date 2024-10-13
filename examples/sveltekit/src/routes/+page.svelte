<script lang="ts">
  import { Highlight } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  import DynamicImport from "$lib/DynamicImport.svelte";
  import ScopedStyles from "$lib/ScopedStyles.svelte";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<Highlight language={typescript} {code} />

<DynamicImport />

<ScopedStyles />
