<script>
  import Highlight, { HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  // SEAL_CHUNK_LINES is 256 (module constant in HighlightStream.svelte) -
  // these batches are sized to land squarely inside, exactly at, and past
  // that boundary so sealing is actually exercised more than once.
  export let firstBatch = 300;
  export let secondBatch = 300;

  let code = "";
  let linesSent = 0;
  let done = false;
  let highlighted = "";
  let highlightCount = 0;
  let referenceHighlighted = "";

  function appendLines(n) {
    let extra = "";
    for (let i = 0; i < n; i++) {
      extra += `const x${linesSent} = ${linesSent}; // line ${linesSent}\n`;
      linesSent++;
    }
    code += extra;
  }

  // Seed one line immediately so data-line="0" exists on first mount.
  appendLines(1);

  function appendFirstBatch() {
    appendLines(firstBatch - linesSent);
  }

  function appendSecondBatch() {
    appendLines(firstBatch + secondBatch - linesSent);
  }

  function finish() {
    done = true;
  }
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<button type="button" data-testid="append-first" on:click={appendFirstBatch}>
  Append to {firstBatch}
</button>
<button type="button" data-testid="append-second" on:click={appendSecondBatch}>
  Append to {firstBatch + secondBatch}
</button>
<button type="button" data-testid="finish" on:click={finish}>Finish</button>

<HighlightStream
  language={javascript}
  {code}
  {done}
  data-testid="stream"
  on:highlight={(e) => {
    highlighted = e.detail.highlighted;
    highlightCount += 1;
  }}
/>

<span data-testid="lines-sent">{linesSent}</span>
<span data-testid="highlight-count">{highlightCount}</span>
<pre data-testid="highlighted-snapshot" style="display:none">{highlighted}</pre>
<pre
  data-testid="reference-highlighted-snapshot"
  style="display:none"
>{referenceHighlighted}</pre>

<Highlight
  language={javascript}
  {code}
  data-testid="reference"
  on:highlight={(e) => {
    referenceHighlighted = e.detail.highlighted;
  }}
/>
