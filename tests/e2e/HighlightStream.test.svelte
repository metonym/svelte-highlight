<script>
  import Highlight, { HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  // Chunk boundaries split mid-keyword ("con" | "st") and mid-template-literal
  // ("`Hel" | "lo, world!"). Concatenated: `const greet = () => \`Hello, world!\`;`
  const CHUNKS = ["con", "st gr", "eet = () => `Hel", "lo, world!", "`;"];

  let code = "";
  let done = false;
  let chunksSent = 0;
  let highlightCount = 0;
  let doneCount = 0;

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
  language={javascript}
  {code}
  {done}
  data-testid="stream"
  on:highlight={() => (highlightCount += 1)}
  on:done={() => (doneCount += 1)}
/>

<span data-testid="highlight-count">{highlightCount}</span>
<span data-testid="done-count">{doneCount}</span>

{#if done}
  <Highlight language={javascript} {code} data-testid="reference" />
{/if}
