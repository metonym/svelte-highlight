<script>
  export let name = "";
  export let moduleName = "";

  import HighlightSvelte from "svelte-highlight/HighlightSvelte.svelte";

  $: code = `<script>
  import { HighlightAuto } from "svelte-highlight";
  import ${moduleName} from "svelte-highlight/styles/${name}";
  
  const code = ".body { padding: 0; margin: 0; }";
<\/script>

<svelte:head>
  {@html ${moduleName}}
</svelte:head>

<HighlightAuto {code} />`;
</script>

<HighlightSvelte class={moduleName} {code} />
