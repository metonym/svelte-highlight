<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import { onDestroy, onMount } from "svelte";
  import { HighlightStream, HighlightSvelte } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import { simulateStream } from "./stream-demo.js";

  const full = `const greet = (name) => {
  return \`Hello, \${name}!\`;
};

console.log(greet("world"));`;

  const snippet = `<script>
  import { HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import github from "svelte-highlight/styles/github";

  let code = "";
  let done = false;

  // Wire this up to your streaming source (fetch, WebSocket, SSE, ...).
  async function stream() {
    for (const chunk of chunks) {
      code += chunk;
      await new Promise((r) => setTimeout(r, 30));
    }
    done = true;
  }
<\/script>

<svelte:head>
  {@html github}
<\/svelte:head>

<HighlightStream language={javascript} {code} {done} />`;

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

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<HighlightStream
  language={javascript}
  {code}
  {done}
  class={THEME_MODULE_NAME}
/>

<Button size="small" kind="tertiary" style="margin-top: 0.75rem" on:click={run}>
  Replay
</Button>
