<script>
  export let name = "";
  export let moduleName = "";

  import HighlightSvelte from "svelte-highlight/HighlightSvelte.svelte";

  $: code = `<script>
  import { HighlightSvelte } from "svelte-highlight";
  import ${moduleName} from "svelte-highlight/styles/${name}";
  
  const code = \`<button on:click={() => { console.log(0); }}>Click me</button>\`;
<\/script>

<svelte:head>
  {@html ${moduleName}}
</svelte:head>

<HighlightSvelte {code} />`;
</script>

<HighlightSvelte class={moduleName} {code} />
