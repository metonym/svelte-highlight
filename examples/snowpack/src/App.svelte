<script>
  import { Highlight } from "svelte-highlight";
  import { typescript } from "svelte-highlight/languages/index.mjs";
  import "svelte-highlight/styles/github.css";

  $: code = `const add = (a: number, b: number) => a + b;`;
</script>

<Highlight language="{typescript}" code="{code}" />
