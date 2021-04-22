<script>
  export let code = "";

  import { CodeSnippet } from "carbon-components-svelte";
  import copy from "copy-to-clipboard";
</script>

<CodeSnippet {...$$restProps} code="{code}" on:click="{() => copy(code)}" />
