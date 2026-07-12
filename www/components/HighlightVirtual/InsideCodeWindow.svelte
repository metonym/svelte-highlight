<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { CodeWindow, HighlightVirtual } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { generateTypeScript } from "./generate-large-code.js";

  const code = generateTypeScript(15_000);
</script>

<CodeWindow variant="macos" title="huge-file.ts">
  <HighlightVirtual
    language={typescript}
    {code}
    class={THEME_MODULE_NAME}
    style="height: 260px"
  />
</CodeWindow>
