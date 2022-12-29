<script>
  // @ts-check
  export let snippet = "<LineNumbers {highlighted} />";

  import { HighlightSvelte } from "../../../src";
  import LineNumbers from "../../../src/LineNumbers.svelte";
  import atomOneDark from "../../../src/styles/atom-one-dark";

  const code = `<script>
  import Hightlight, { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = "const add = (a: number, b: number) => a + b";
<\/script>
  
<svelte:head>
  {@html atomOneDark}
</svelte:head>

<Highlight language={typescript} {code} let:highlighted>
  ${snippet}
</Highlight>`;
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<HighlightSvelte {code} let:highlighted>
  <LineNumbers {highlighted} {...$$restProps} />
</HighlightSvelte>
