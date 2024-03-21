<script>
  // @ts-check

  /** @type {string} */
  export let name;

  /** @type {string} */
  export let moduleName;

  /** @type {boolean} */
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

<HighlightSvelte class="ashes" {code} />
