<script>
  // @ts-check

  export let name = "";
  export let moduleName = "";

  import HighlightAuto from "svelte-highlight/HighlightAuto.svelte";

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

<HighlightAuto class={moduleName} {code} />
