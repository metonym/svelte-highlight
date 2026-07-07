<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import Highlight, { HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";

  // Boundaries deliberately split mid-keyword ("con" | "st") and
  // mid-template-literal ("`Hel" | "lo, world!").
  const CHUNKS = ["con", "st gr", "eet = () => `Hel", "lo, world!", "`;"];

  let code = "";
  let sent = 0;
  let done = false;

  function next() {
    if (sent >= CHUNKS.length) return;
    code += CHUNKS[sent];
    sent += 1;
    if (sent === CHUNKS.length) done = true;
  }

  function reset() {
    code = "";
    sent = 0;
    done = false;
  }
</script>

<p class="label-01 mb-3">
  Click through each chunk to watch it arrive mid-keyword and
  mid-template-literal. Once every chunk lands, the output below is compared
  byte-for-byte against a plain <code class="code">Highlight</code> of the same
  finished code.
</p>

<div class="chunks mb-5">
  {#each CHUNKS as chunk, i}
    <code class="chunk" class:sent={i < sent}>{JSON.stringify(chunk)}</code>
  {/each}
</div>

<HighlightStream
  language={javascript}
  {code}
  {done}
  class={THEME_MODULE_NAME}
/>

<div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.75rem">
  <Button
    size="small"
    kind="tertiary"
    disabled={sent >= CHUNKS.length}
    on:click={next}
  >
    Send next chunk ({sent}/{CHUNKS.length})
  </Button>
  <Button size="small" kind="ghost" on:click={reset}>Reset</Button>
</div>

{#if done}
  <p class="label-01 mb-3" style="margin-top: 1.5rem">
    Reference <code class="code">Highlight</code> of the same code, for
    comparison:
  </p>
  <Highlight language={javascript} {code} class={THEME_MODULE_NAME} />
{/if}

<style>
  .chunks {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chunk {
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--cds-ui-04, #8d8d8d);
    opacity: 0.5;
    font-size: 0.75rem;
  }

  .chunk.sent {
    opacity: 1;
    border-color: #42be65;
    color: #42be65;
  }
</style>
