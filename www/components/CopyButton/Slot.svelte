<script>
  import { THEME_MODULE_NAME, THEME_NAME } from "@www/constants";
  import { CopyButton, HighlightSvelte } from "svelte-highlight";

  const code = `<script>
  import Highlight, { CopyButton } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import ${THEME_MODULE_NAME} from "svelte-highlight/styles/${THEME_NAME}";

  const code = "const add = (a: number, b: number) => a + b";
<\/script>

<svelte:head>
  {@html ${THEME_MODULE_NAME}}
</svelte:head>

<div style="position: relative">
  <Highlight language={typescript} {code} />
  <CopyButton {code} let:copied --copy-right="2em">
    {#if copied}
      Copied!
    {:else}
      Copy
    {/if}
  </CopyButton>
</div>`;
</script>

<div style="position: relative">
  <HighlightSvelte {code} class={THEME_MODULE_NAME} />
  <CopyButton {code} let:copied --copy-right="2em">
    {#if copied}
      Copied!
    {:else}
      Copy
    {/if}
  </CopyButton>
</div>
