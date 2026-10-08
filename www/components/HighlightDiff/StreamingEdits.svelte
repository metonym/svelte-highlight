<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import { onDestroy, onMount } from "svelte";
  import { HighlightDiff, streamEditPrefix } from "svelte-highlight";
  import python from "svelte-highlight/languages/python";
  import { simulateStream } from "../HighlightStream/stream-demo.js";
  import { editSource, streamedEditOutput } from "./samples.js";

  let output = "";
  let done = false;
  /** @type {ReturnType<typeof simulateStream>} */
  let stop;

  $: preview = streamEditPrefix(editSource, output, { done });
  $: settled = preview.edits.filter((e) => e.complete).length;

  function run() {
    stop?.();
    output = "";
    done = false;
    stop = simulateStream(streamedEditOutput, {
      intervalMs: 25,
      minChunk: 2,
      maxChunk: 8,
      onChunk: (chunk) => (output += chunk),
      onDone: () => (done = true),
    });
  }

  onMount(run);
  onDestroy(() => stop?.());
</script>

<div class="controls">
  <Button size="small" on:click={run}>Restart</Button>
  <span class="label-01">
    format: <code class="code">{preview.format}</code> · {settled} of
    {preview.edits.length}
    edits settled · {done ? "done" : "streaming…"}
  </span>
</div>

<div class="pair">
  <pre class="raw">{output}<span class="cursor">▍</span></pre>
  <HighlightDiff
    before={editSource}
    after={preview.after}
    streaming={!preview.done}
    language={python}
    class={THEME_MODULE_NAME}
    style="height: 420px"
  />
</div>

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1rem 1.5rem;
    margin-bottom: 1rem;
  }

  .pair {
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: 1rem;
  }

  .raw {
    font-family: ui-monospace, Menlo, monospace;
    height: 420px;
    overflow: auto;
    margin: 0;
    padding: 0.75rem;
    font-size: 12px;
    background: #161616;
    color: #c6c6c6;
    white-space: pre-wrap;
  }

  .cursor {
    color: #78a9ff;
  }
</style>
