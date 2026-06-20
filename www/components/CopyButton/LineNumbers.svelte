<script>
  import { THEME_MODULE_NAME, THEME_NAME } from "@www/constants";
  import { CopyButton, HighlightSvelte, LineNumbers } from "svelte-highlight";

  const code = `<script>
  import Highlight, { CopyButton, LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import ${THEME_MODULE_NAME} from "svelte-highlight/styles/${THEME_NAME}";

  const code = "const add = (a: number, b: number) => a + b";
<\/script>

<svelte:head>
  {@html ${THEME_MODULE_NAME}}
</svelte:head>

<div style="position: relative">
  <Highlight language={typescript} {code} let:highlighted>
    <LineNumbers {highlighted} />
  </Highlight>
  <CopyButton {code} />
</div>`;
</script>

<div style="position: relative">
  <HighlightSvelte {code} let:highlighted>
    <LineNumbers class={THEME_MODULE_NAME} {highlighted} />
  </HighlightSvelte>
  <CopyButton {code} />
</div>
