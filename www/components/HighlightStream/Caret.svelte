<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import { onDestroy, onMount } from "svelte";
  import { HighlightStream } from "svelte-highlight";
  import python from "svelte-highlight/languages/python";
  import { simulateStream } from "./stream-demo.js";

  const full = `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`;

  let code = "";
  let done = false;
  let stop = () => {};

  function run() {
    stop();
    code = "";
    done = false;
    stop = simulateStream(full, {
      onChunk: (chunk) => (code += chunk),
      onDone: () => (done = true),
    });
  }

  onMount(run);
  onDestroy(() => stop());
</script>

<p class="label-01 mb-3">
  <code class="code">--caret-width</code>,
  <code class="code">--caret-color</code>, and
  <code class="code">--caret-blink</code>
  reuse the same contract as
  <code class="code">Typewriter</code>.
</p>

<HighlightStream
  language={python}
  {code}
  {done}
  class={THEME_MODULE_NAME}
  --caret-width="8px"
  --caret-color="#ff7eb6"
  --caret-blink="0.4s"
/>

<Button size="small" kind="tertiary" style="margin-top: 0.75rem" on:click={run}>
  Replay
</Button>
