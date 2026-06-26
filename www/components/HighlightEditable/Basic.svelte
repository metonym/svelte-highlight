<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { HighlightEditable } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  let code = "const add = (a: number, b: number) => a + b;";
</script>

<HighlightEditable language={typescript} bind:code class={THEME_MODULE_NAME} />

<p class="label-01" style="margin-top: 0.75rem">
  bind:code: <code class="code">{code}</code>
</p>
