<script>
  import Highlight, { HighlightStream } from "svelte-highlight";
  import json from "svelte-highlight/languages/json";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  // No embedded newlines until finish: mid-stream `on:highlight` must still
  // carry a growing `highlighted` payload (not a stale empty string).
  const CHUNKS = ['{"a":1,', '"b":2,', '"c":3,', '"d":4}'];

  let code = "";
  let done = false;
  let chunksSent = 0;
  /** @type {number[]} */
  let lengths = [];
  let lastHighlighted = "";

  function appendChunk() {
    if (chunksSent >= CHUNKS.length) return;
    code += CHUNKS[chunksSent];
    chunksSent += 1;
  }

  function finish() {
    done = true;
  }
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<button type="button" data-testid="append-chunk" on:click={appendChunk}>
  Append chunk
</button>
<button type="button" data-testid="finish" on:click={finish}>Finish</button>

<HighlightStream
  language={json}
  {code}
  {done}
  data-testid="stream"
  on:highlight={(e) => {
    lastHighlighted = e.detail.highlighted;
    lengths = [...lengths, lastHighlighted.length];
  }}
/>

<span data-testid="payload-lengths">{JSON.stringify(lengths)}</span>
<span data-testid="highlighted-snapshot">{lastHighlighted}</span>

{#if done}
  <Highlight language={json} {code} let:highlighted>
    <span data-testid="reference-highlighted-snapshot">{highlighted}</span>
  </Highlight>
{/if}
