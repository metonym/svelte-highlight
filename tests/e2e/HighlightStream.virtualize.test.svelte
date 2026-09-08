<script>
  import { HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  export let overscan = 5;
  export let autoScroll = false;

  /** @type {import("../../src/HighlightStream.svelte").default} */
  let ref;
  let code = "";
  let done = false;
  let doneCount = 0;
  let windowChangeCount = 0;
  let lastWindow = { start: 0, end: 0, lineCount: 0 };

  function appendLines(n) {
    let extra = "";
    for (let i = 0; i < n; i++) extra += `const x${i} = ${i}; // line ${i}\n`;
    code += extra;
  }

  function appendMany() {
    appendLines(2000);
  }

  function appendFew() {
    appendLines(3);
  }

  function finish() {
    done = true;
  }
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<button type="button" data-testid="append-many" on:click={appendMany}>
  Append 2000 lines
</button>
<button type="button" data-testid="append-few" on:click={appendFew}>
  Append 3 lines
</button>
<button type="button" data-testid="finish" on:click={finish}>Finish</button>
<span data-testid="done-count">{doneCount}</span>
<span data-testid="window-change-count">{windowChangeCount}</span>
<span data-testid="window-change-snapshot">{JSON.stringify(lastWindow)}</span>

<HighlightStream
  bind:this={ref}
  language={javascript}
  {code}
  {done}
  {autoScroll}
  virtualize
  {overscan}
  data-testid="stream"
  style="height: 300px; width: 600px;"
  on:done={() => (doneCount += 1)}
  on:windowchange={(e) => {
    windowChangeCount += 1;
    lastWindow = e.detail;
  }}
/>
<button
  type="button"
  data-testid="scroll-to-1000"
  on:click={() => ref.scrollToLine(1000)}
>
  Scroll to line 1000
</button>
