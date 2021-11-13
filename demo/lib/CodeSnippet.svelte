<script>
  export let code = "";

  import { CodeSnippet } from "carbon-components-svelte";
</script>

<CodeSnippet {...$$restProps} {code} />
