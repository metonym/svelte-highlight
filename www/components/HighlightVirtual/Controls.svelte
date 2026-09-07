<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button, NumberInput, Slider } from "carbon-components-svelte";
  import { HighlightVirtual } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { generateTypeScript } from "./generate-large-code.js";

  const LINE_COUNT = 20_000;
  const code = generateTypeScript(LINE_COUNT);

  let overscan = 12;
  let checkpointInterval = 100;
  let jumpToLine = 10_000;

  /** @type {HighlightVirtual} */
  let ref;

  /** @type {{ start: number; end: number; lineCount: number }} */
  let win = { start: 0, end: 0, lineCount: 0 };

  function jump() {
    ref?.scrollToLine(jumpToLine ?? 0);
  }
</script>

<HighlightVirtual
  bind:this={ref}
  language={typescript}
  {code}
  {overscan}
  {checkpointInterval}
  class={THEME_MODULE_NAME}
  style="height: 320px"
  on:windowchange={(e) => (win = e.detail)}
/>

<div
  style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 1.5rem; margin-top: 1rem"
>
  <Slider
    bind:value={overscan}
    min={0}
    max={100}
    step={4}
    labelText="overscan (extra lines above/below the viewport)"
  />
  <Slider
    bind:value={checkpointInterval}
    min={10}
    max={500}
    step={10}
    labelText="checkpointInterval (lines between engine checkpoints)"
  />
  <div style="display: flex; align-items: flex-end; gap: 0.5rem">
    <NumberInput
      id="jump-to-line"
      size="sm"
      min={0}
      max={LINE_COUNT}
      bind:value={jumpToLine}
      labelText={`Jump to line (of ${LINE_COUNT.toLocaleString()})`}
    />
    <Button size="small" kind="tertiary" on:click={jump}>Jump</Button>
  </div>
  <p class="label-01" style="margin-bottom: 0.5rem">
    Rendered window: <code class="code">{win.start}-{win.end}</code> of
    <code class="code">{win.lineCount}</code>
    lines
  </p>
</div>
