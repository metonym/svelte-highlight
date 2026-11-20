<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Toggle } from "carbon-components-svelte";
  import { HighlightDiff } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import {
    movedAfter,
    movedBefore,
    whitespaceAfter,
    whitespaceBefore,
  } from "./samples.js";

  let detectMoves = true;
  let ignoreWhitespace = true;
</script>

<div class="pair">
  <div>
    <h5>Moved block</h5>
    <Toggle size="sm" bind:toggled={detectMoves} labelText="Detect moves" />
    <p class="label-01 mb-3">Hover a purple line to see where it moved.</p>
    <HighlightDiff
      before={movedBefore}
      after={movedAfter}
      language={javascript}
      {detectMoves}
      class={THEME_MODULE_NAME}
      style="height: 360px"
    />
  </div>
  <div>
    <h5>Re-indented block</h5>
    <Toggle
      size="sm"
      bind:toggled={ignoreWhitespace}
      labelText="Ignore whitespace"
    />
    <p class="label-01 mb-3">Only the early return is a real change.</p>
    <HighlightDiff
      before={whitespaceBefore}
      after={whitespaceAfter}
      language={javascript}
      {ignoreWhitespace}
      class={THEME_MODULE_NAME}
      style="height: 360px"
    />
  </div>
</div>

<style>
  .pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
</style>
