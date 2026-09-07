<script>
  import Highlight, { HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import json from "svelte-highlight/languages/json";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  let code = "const a = 1;";

  function appendLines() {
    let extra = "";
    for (let i = 0; i < 50; i++) extra += `\nconst x${i} = ${i};`;
    code += extra;
  }

  // >= 64 KB, single line, no newline until the very end - the mid-line
  // checkpoint resume path (src/stream-preview.js) only matters once a
  // stream stays on one line for a long stretch.
  function longLineJson(targetLength) {
    const items = [];
    let length = 2; // "{}"
    let i = 0;
    while (length < targetLength) {
      const item = `"item-${i}":${i}`;
      items.push(item);
      length += item.length + 1; // + comma
      i++;
    }
    return `{${items.join(",")}}`;
  }

  const LONG_LINE = longLineJson(64 * 1024);
  const LONG_LINE_CHUNK_SIZE = 1000;

  let longLineCode = "";
  let longLineChunksSent = 0;
  let longLineDone = false;
  let longLineHighlighted = "";

  function streamLongLine() {
    function step() {
      if (longLineChunksSent >= LONG_LINE.length) {
        longLineDone = true;
        return;
      }
      longLineCode += LONG_LINE.slice(
        longLineChunksSent,
        longLineChunksSent + LONG_LINE_CHUNK_SIZE,
      );
      longLineChunksSent += LONG_LINE_CHUNK_SIZE;
      requestAnimationFrame(step);
    }
    step();
  }
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<button type="button" data-testid="append-lines" on:click={appendLines}>
  Append 50 lines
</button>

<HighlightStream language={javascript} {code} data-testid="stream" />

<button type="button" data-testid="stream-long-line" on:click={streamLongLine}>
  Stream 64 KB single line
</button>
<span data-testid="long-line-done">{longLineDone}</span>

<HighlightStream
  language={json}
  code={longLineCode}
  data-testid="long-line-stream"
  on:highlight={(e) => (longLineHighlighted = e.detail.highlighted)}
/>
<span data-testid="long-line-highlighted-snapshot">{longLineHighlighted}</span>

{#if longLineDone}
  <Highlight language={json} code={longLineCode} let:highlighted>
    <span data-testid="long-line-reference">{highlighted}</span>
  </Highlight>
{/if}
