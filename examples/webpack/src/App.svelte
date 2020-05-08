<script>
  import { Highlight } from "svelte-highlight";
  import { typescript } from "svelte-highlight/languages";
  import "svelte-highlight/styles/an-old-hope.css";

  $: code = `const add = (a: number, b: number) => a + b;`;
</script>

<Highlight language={typescript} {code} />
