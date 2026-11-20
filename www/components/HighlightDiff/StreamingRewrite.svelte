<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import {
    Button,
    Select,
    SelectItem,
    Slider,
    Toggle,
  } from "carbon-components-svelte";
  import { onDestroy, onMount } from "svelte";
  import { HighlightDiff } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { simulateStream } from "../HighlightStream/stream-demo.js";
  import { streamAfter, streamBefore } from "./samples.js";

  let after = "";
  let streaming = true;
  let follow = true;
  let paused = false;
  let speed = 35;
  /** @type {"unified" | "split"} */
  let view = "unified";
  /** @type {ReturnType<typeof simulateStream>} */
  let stop;

  function run() {
    stop?.();
    after = "";
    streaming = true;
    paused = false;
    stop = simulateStream(streamAfter, {
      intervalMs: speed,
      minChunk: 1,
      maxChunk: 6,
      onChunk: (chunk) => (after += chunk),
      onDone: () => (streaming = false),
    });
  }

  function togglePause() {
    paused = !paused;
    if (paused) stop.pause();
    else stop.resume();
  }

  onMount(run);
  onDestroy(() => stop?.());
</script>

<div class="controls">
  <Button size="small" on:click={run}>Restart</Button>
  <Button
    size="small"
    kind="tertiary"
    disabled={!streaming}
    on:click={togglePause}
  >
    {paused ? "Resume" : "Pause"}
  </Button>
  <Slider
    bind:value={speed}
    min={5}
    max={120}
    labelText="Interval (ms, applies on restart)"
  />
  <Select inline size="sm" labelText="View" bind:selected={view}>
    <SelectItem value="unified" text="Unified" />
    <SelectItem value="split" text="Split" />
  </Select>
  <Toggle size="sm" bind:toggled={follow} labelText="Follow" />
  <span class="label-01"
    >{streaming ? "streaming…" : "done"}
    · {after.length} / {streamAfter.length} chars</span
  >
</div>

<HighlightDiff
  before={streamBefore}
  {after}
  {streaming}
  {follow}
  {view}
  language={typescript}
  class={THEME_MODULE_NAME}
  style="height: 420px"
/>

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1rem 1.5rem;
    margin-bottom: 1rem;
  }
</style>
