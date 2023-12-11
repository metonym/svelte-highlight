<script>
  // @ts-check

  export let snippet = "<LineNumbers {highlighted} />";

  import { HighlightSvelte, LineNumbers } from "svelte-highlight";

  const code = `<script>
  import Highlight, { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import irBlack from "svelte-highlight/styles/ir-black";

  const code = "const add = (a: number, b: number) => a + b";
<\/script>
  
<svelte:head>
  {@html irBlack}
</svelte:head>

<Highlight language={typescript} {code} let:highlighted>
  ${snippet}
</Highlight>`;
</script>

<HighlightSvelte {code} let:highlighted>
  <LineNumbers class="irBlack" {highlighted} {...$$restProps} />
</HighlightSvelte>
