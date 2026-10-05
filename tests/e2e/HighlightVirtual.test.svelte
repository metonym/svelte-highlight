<script>
  import { HighlightVirtual } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  export const LINE_COUNT = 5000;

  function generateCode(lines) {
    let out = "";
    for (let i = 0; i < lines; i++) out += `const x${i} = ${i}; // line ${i}\n`;
    return out;
  }

  export let code = generateCode(LINE_COUNT);
  export let overscan = 5;

  /** @type {import("../../src/HighlightVirtual.svelte").default} */
  let ref;
  let win = { start: 0, end: 0, lineCount: 0 };
  // Whether the window's first row was already in the DOM when
  // windowchange fired, for every dispatch so far.
  let rowsReady = true;

  function onWindowChange(event) {
    win = event.detail;
    const row = document.querySelector(
      `[data-testid="virtual"] [data-line="${event.detail.start}"]`,
    );
    if (event.detail.lineCount > 0 && !row) rowsReady = false;
  }
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<HighlightVirtual
  bind:this={ref}
  language={javascript}
  {code}
  {overscan}
  data-testid="virtual"
  style="height: 300px; width: 600px;"
  on:windowchange={onWindowChange}
  {...$$restProps}
/>
<pre data-testid="window">{JSON.stringify(win)}</pre>
<pre data-testid="rows-ready">{rowsReady}</pre>
<button
  type="button"
  data-testid="scroll-to-2500"
  on:click={() => ref.scrollToLine(2500)}
>
  Scroll to line 2500
</button>
