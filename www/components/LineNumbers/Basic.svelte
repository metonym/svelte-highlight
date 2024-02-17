<script>
  // @ts-check

  export let snippet = "<LineNumbers {highlighted} />";

  import { HighlightSvelte, LineNumbers } from "svelte-highlight";

  const code = `<script>
  import Highlight, { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atlas from "svelte-highlight/styles/atlas";

  const code = "const add = (a: number, b: number) => a + b";
<\/script>
  
<svelte:head>
  {@html atlas}
</svelte:head>

<Highlight language={typescript} {code} let:highlighted>
  ${snippet}
</Highlight>`;
</script>

<HighlightSvelte {code} let:highlighted>
  <LineNumbers class="atlas" {highlighted} {...$$restProps} />
</HighlightSvelte>
