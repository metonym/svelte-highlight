<script>
  export let name = "";
  export let moduleName = "";

  import HighlightSvelte from "svelte-highlight/HighlightSvelte.svelte";

  $: code = `<script>
  import { HighlightSvelte } from "svelte-highlight";
  import ${moduleName} from "svelte-highlight/styles/${name}";

  const code = \`<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
<\/script>

<button on:click={() => count++}>{doubled} (store: {$externalCount})</button>\`;
<\/script>

<svelte:head>
  {@html ${moduleName}}
</svelte:head>

<HighlightSvelte {code} />`;
</script>

<HighlightSvelte class={moduleName} {code} />
