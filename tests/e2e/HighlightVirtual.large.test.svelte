<script>
  import { HighlightVirtual } from "svelte-highlight";
  import json from "svelte-highlight/languages/json";

  export const LINE_COUNT = 100_000;

  // Generated here, not passed as a prop, so the 4 MB document doesn't
  // cross the test runner's serialization bridge.
  function generateLog(lines) {
    const parts = [];
    for (let i = 0; i < lines; i++) {
      parts.push(`  "${String(i).padStart(6, "0")} INFO processed item ${i}",`);
    }
    return `[\n${parts.join("\n")}\n]`;
  }

  const code = generateLog(LINE_COUNT);

  /** @type {import("../../src/HighlightVirtual.svelte").default} */
  let ref;
  let win = { start: 0, end: 0, lineCount: 0 };
</script>

<HighlightVirtual
  bind:this={ref}
  language={json}
  {code}
  data-testid="virtual"
  style="height: 300px; width: 600px;"
  on:windowchange={(e) => (win = e.detail)}
/>
<pre data-testid="window">{JSON.stringify(win)}</pre>
<button
  type="button"
  data-testid="to-end"
  on:click={() => ref.scrollToLine(win.lineCount - 1)}
>
  End
</button>
<button
  type="button"
  data-testid="to-middle"
  on:click={() => ref.scrollToLine(Math.floor(win.lineCount / 2))}
>
  Middle
</button>
