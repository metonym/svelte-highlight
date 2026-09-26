<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { HighlightDiff } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const before = `export function greet(name: string) {
  return "Hello, " + name;
}`;
  const after = `export function greet(name: string) {
  return "Hello, " + name + "!";
}`;
</script>

<HighlightDiff
  {before}
  {after}
  gutter="unified"
  language={typescript}
  class={THEME_MODULE_NAME}
/>
