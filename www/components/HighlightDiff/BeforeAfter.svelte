<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { HighlightDiff } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const lines = Array.from(
    { length: 24 },
    (_, i) => `const line${i + 1} = ${i + 1};`,
  );
  const before = lines.join("\n");

  const afterLines = [...lines];
  afterLines[11] = "const line12 = 1200;";
  const after = afterLines.join("\n");
</script>

<HighlightDiff
  {before}
  {after}
  context={3}
  language={typescript}
  class={THEME_MODULE_NAME}
/>
