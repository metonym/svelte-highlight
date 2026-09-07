<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import { HighlightEditable } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  let code = "const add = (a: number, b: number) => a + b;";
  let readonly = false;
</script>

<HighlightEditable
  language={typescript}
  bind:code
  {readonly}
  class={THEME_MODULE_NAME}
/>

<div style="margin-top: 0.5rem">
  <Button size="small" kind="tertiary" on:click={() => (readonly = !readonly)}>
    {readonly ? "Unlock" : "Lock"}
  </Button>
</div>
