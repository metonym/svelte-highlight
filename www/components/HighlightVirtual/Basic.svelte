<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { HighlightVirtual } from "svelte-highlight";
  import json from "svelte-highlight/languages/json";
  import {
    generateJsonLog,
    trackRenderedLineCount,
  } from "./generate-large-code.js";

  const LINE_COUNT = 80_000;
  const code = generateJsonLog(LINE_COUNT);

  let renderedLineCount = 0;
</script>

<p class="label-01 mb-3">
  {LINE_COUNT.toLocaleString()}
  lines, rendered instantly. Only
  <strong>{renderedLineCount}</strong>
  line nodes are ever in the DOM at once -- scroll to confirm the count stays
  flat.
</p>

<div use:trackRenderedLineCount={(n) => (renderedLineCount = n)}>
  <HighlightVirtual
    language={json}
    {code}
    class={THEME_MODULE_NAME}
    style="height: 320px"
  />
</div>
