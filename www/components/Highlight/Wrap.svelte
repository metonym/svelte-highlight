<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import Highlight, { HighlightSvelte } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const code =
    'const message = "This is a single very long line of code that demonstrates how the wrap prop lets long lines wrap instead of scrolling horizontally.";';

  const snippet = "<Highlight wrap language={typescript} {code} />";
</script>

<div class="mb-3">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>
<div class="mb-5" style="max-width: 28em;">
  <Highlight wrap language={typescript} {code} />
</div>
