<script>
  // @ts-check
  export let name;
  export let moduleName;
  export let useDirectImport;

  import HighlightSvelte from "svelte-highlight/HighlightSvelte.svelte";

  $: code = `<script>
  import Highlight from "svelte-highlight";
  import ${
    useDirectImport ? moduleName : `{ ${moduleName} }`
  } from "svelte-highlight/languages${useDirectImport ? `/${name}` : ""}";
<\/script>

<Highlight language={${moduleName}} code="code" />`;
</script>

<HighlightSvelte class="irBlack" {code} />
