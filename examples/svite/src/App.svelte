<script>
  import Highlight from "svelte-highlight/src/Highlight.svelte";
  import { typescript } from "svelte-highlight/languages";
  import { anOldHope } from "svelte-highlight/styles";

  $: code = `const add = (a: number, b: number) => a + b;`;
</script>

<svelte:head>
  {@html anOldHope}
</svelte:head>

<Highlight language={typescript} {code} />
