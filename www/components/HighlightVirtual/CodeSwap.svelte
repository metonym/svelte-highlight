<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import { HighlightVirtual } from "svelte-highlight";
  import json from "svelte-highlight/languages/json";
  import { generateJsonLog } from "./generate-large-code.js";

  const documents = [
    { label: "30,000 lines", code: generateJsonLog(30_000) },
    { label: "3,000 lines", code: generateJsonLog(3_000) },
  ];

  let active = 0;
  $: code = documents[active].code;
</script>

<p class="label-01 mb-3">
  Swapping <code class="code">code</code> for a different (here, much shorter)
  document rebuilds the underlying <code class="code">TokenizedDocument</code>
  and clamps an out-of-range scroll position -- try scrolling to the bottom of
  the long document, then switching.
</p>

<div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem">
  {#each documents as doc, i}
    <Button
      size="small"
      kind={active === i ? "primary" : "tertiary"}
      on:click={() => (active = i)}
    >
      {doc.label}
    </Button>
  {/each}
</div>

<HighlightVirtual
  language={json}
  {code}
  class={THEME_MODULE_NAME}
  style="height: 260px"
/>
