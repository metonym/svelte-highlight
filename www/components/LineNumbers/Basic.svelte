<script>
  import { THEME_NAME, THEME_MODULE_NAME } from "@www/constants";

  export let snippet = "<LineNumbers {highlighted} />";

  import { HighlightSvelte, LineNumbers } from "svelte-highlight";

  const code = `<script>
  import Highlight, { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import ${THEME_MODULE_NAME} from "svelte-highlight/styles/${THEME_NAME}";

  const code = "const add = (a: number, b: number) => a + b";
<\/script>
  
<svelte:head>
  {@html ${THEME_MODULE_NAME}}
</svelte:head>

<Highlight language={typescript} {code} let:highlighted>
  ${snippet}
</Highlight>`;
</script>

<HighlightSvelte {code} let:highlighted>
  <LineNumbers class={THEME_MODULE_NAME} {highlighted} {...$$restProps} />
</HighlightSvelte>
