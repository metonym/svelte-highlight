<script>
  import { THEME_MODULE_NAME, THEME_NAME } from "@www/constants";
  import { CopyButton, HighlightSvelte } from "svelte-highlight";

  const snippet = `const code = "const add = (a: number, b: number) => a + b";

  // Override the default Clipboard API behavior.
  function copy(code) {
    navigator.clipboard.writeText(code);
    console.log("Copied:", code);
  }`;

  const code = `<script>
  import Highlight, { CopyButton } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import ${THEME_MODULE_NAME} from "svelte-highlight/styles/${THEME_NAME}";

  ${snippet}
<\/script>

<svelte:head>
  {@html ${THEME_MODULE_NAME}}
</svelte:head>

<div style="position: relative">
  <Highlight language={typescript} {code} />
  <CopyButton {code} {copy} />
</div>`;

  function copy(value) {
    navigator.clipboard.writeText(value);
    console.log("Copied:", value);
  }
</script>

<div style="position: relative">
  <HighlightSvelte {code} class={THEME_MODULE_NAME} />
  <CopyButton {code} {copy} />
</div>
