<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button, NumberInput, Slider } from "carbon-components-svelte";
  import { HighlightVirtual } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import {
    generateTypeScript,
    trackRenderedLineCount,
  } from "./generate-large-code.js";

  const LINE_COUNT = 20_000;
  const code = generateTypeScript(LINE_COUNT);

  let overscan = 12;
  let checkpointInterval = 100;
  let renderedLineCount = 0;
  let jumpToLine = 10_000;

  /** @type {HTMLElement} */
  let wrapper;

  function jump() {
    const pre = wrapper?.querySelector("pre");
    if (!pre) return;
    const target = Math.max(0, Math.min(jumpToLine ?? 0, LINE_COUNT));
    // Line height isn't known here; overshoot and let the browser clamp,
    // then nudge back a viewport so the target line lands mid-screen.
    pre.scrollTop = target * 20;
  }
</script>

<div
  bind:this={wrapper}
  use:trackRenderedLineCount={(n) => (renderedLineCount = n)}
>
  <HighlightVirtual
    language={typescript}
    {code}
    {overscan}
    {checkpointInterval}
    class={THEME_MODULE_NAME}
    style="height: 320px"
  />
</div>

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
    Rendered line nodes: <code class="code">{renderedLineCount}</code>
  </p>
</div>
