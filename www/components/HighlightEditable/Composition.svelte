<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Highlight, HighlightEditable, LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  let code = "const add = (a: number, b: number) => a + b;";
</script>

<HighlightEditable language={typescript} bind:code class={THEME_MODULE_NAME} />

<div style="margin-top: 0.75rem">
  <Highlight
    language={typescript}
    {code}
    let:highlighted
    let:languageName
    class={THEME_MODULE_NAME}
  >
    <LineNumbers {highlighted} {languageName} />
  </Highlight>
</div>
