<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button, Toggle } from "carbon-components-svelte";
  import { onDestroy, onMount } from "svelte";
  import { CodeWindow, HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import { simulateStream } from "./stream-demo.js";

  const LINES = Array.from(
    { length: 40 },
    (_, i) => `console.log("step ${i}: ${(i * 7) % 13} items processed");`,
  );
  const full = LINES.join("\n");

  let autoScroll = true;
  let code = "";
  let done = false;
  let stop = () => {};

  function run() {
    stop();
    code = "";
    done = false;
    stop = simulateStream(full, {
      intervalMs: 15,
      minChunk: 4,
      maxChunk: 12,
      onChunk: (chunk) => (code += chunk),
      onDone: () => (done = true),
    });
  }

  onMount(run);
  onDestroy(() => stop());
</script>

<p class="label-01 mb-3">
  A tall, fast-streaming log pinned to a short window. Scroll up mid-stream to
  detach—output keeps arriving below the fold until you scroll back to the
  bottom.
</p>

<CodeWindow variant="terminal" title="build.log">
  <HighlightStream
    language={javascript}
    {code}
    {done}
    {autoScroll}
    class={THEME_MODULE_NAME}
    style="max-height: 10em; overflow-y: auto;"
  />
</CodeWindow>

<div
  style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 1.5rem; margin-top: 0.75rem"
>
  <Toggle
    bind:toggled={autoScroll}
    labelText="Auto-scroll"
    labelA="Off"
    labelB="On"
  />
  <Button size="small" kind="tertiary" on:click={run}>Replay</Button>
</div>
