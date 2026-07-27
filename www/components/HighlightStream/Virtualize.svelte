<script>
  import { trackRenderedLineCount } from "@components/HighlightVirtual/generate-large-code.js";
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button, Toggle } from "carbon-components-svelte";
  import { onDestroy, onMount } from "svelte";
  import { HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import { simulateStream } from "./stream-demo.js";

  const LINE_COUNT = 1500;
  const full = Array.from(
    { length: LINE_COUNT },
    (_, i) => `console.log("line ${i}: ${(i * 7) % 13} items processed");`,
  ).join("\n");

  let autoScroll = true;
  let code = "";
  let done = false;
  let paused = false;
  let renderedLineCount = 0;
  let stop = () => {};

  function run() {
    stop();
    code = "";
    done = false;
    paused = false;
    stop = simulateStream(full, {
      intervalMs: 4,
      minChunk: 20,
      maxChunk: 60,
      onChunk: (chunk) => (code += chunk),
      onDone: () => (done = true),
    });
  }

  function togglePause() {
    paused = !paused;
    if (paused) stop.pause();
    else stop.resume();
  }

  onMount(run);
  onDestroy(() => stop());
</script>

<p class="label-01 mb-3">
  {LINE_COUNT.toLocaleString()}
  lines stream in fast; only the scrolled window is ever in the DOM.
</p>

<div use:trackRenderedLineCount={(n) => (renderedLineCount = n)}>
  <HighlightStream
    language={javascript}
    {code}
    {done}
    {autoScroll}
    virtualize
    class={THEME_MODULE_NAME}
    style="height: 320px"
  />
</div>

<div
  style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 1.5rem; margin-top: 1rem"
>
  <Toggle
    bind:toggled={autoScroll}
    labelText="Auto-scroll"
    labelA="Off"
    labelB="On"
  />
  <Button size="small" kind="tertiary" disabled={done} on:click={togglePause}>
    {paused ? "Resume" : "Pause"}
  </Button>
  <Button size="small" kind="tertiary" on:click={run}>Replay</Button>
  <p class="label-01" style="margin-bottom: 0.5rem">
    Status:{" "}
    <code class="code">{done ? "done" : paused ? "paused" : "streaming…"}</code>
  </p>
  <p class="label-01" style="margin-bottom: 0.5rem">
    Rendered line nodes: <code class="code">{renderedLineCount}</code> of
    {LINE_COUNT.toLocaleString()}
  </p>
</div>
