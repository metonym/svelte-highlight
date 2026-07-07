<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button, Slider, Toggle } from "carbon-components-svelte";
  import { onDestroy, onMount } from "svelte";
  import { HighlightStream } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { simulateStream } from "./stream-demo.js";

  const full = `interface User {
  id: number;
  name: string;
}

function formatUser(user: User): string {
  return \`#\${user.id} \${user.name}\`;
}

const users: User[] = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
  { id: 3, name: "Alan" },
];

for (const user of users) {
  console.log(formatUser(user));
}`;

  let speed = 25;
  let autoScroll = true;
  let code = "";
  let done = false;
  let stop = () => {};

  function run() {
    stop();
    code = "";
    done = false;
    stop = simulateStream(full, {
      intervalMs: speed,
      onChunk: (chunk) => (code += chunk),
      onDone: () => (done = true),
    });
  }

  onMount(run);
  onDestroy(() => stop());
</script>

<HighlightStream
  language={typescript}
  {code}
  {done}
  {autoScroll}
  class={THEME_MODULE_NAME}
  style="max-height: 12em; overflow-y: auto;"
/>

<div
  style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 1.5rem; margin-top: 1rem"
>
  <Slider
    bind:value={speed}
    min={5}
    max={120}
    step={5}
    labelText="Chunk interval (ms, applied on next replay)"
  />
  <Toggle
    bind:toggled={autoScroll}
    labelText="Auto-scroll"
    labelA="Off"
    labelB="On"
  />
  <Button size="small" kind="tertiary" on:click={run}>Replay</Button>
  <p class="label-01" style="margin-bottom: 0.5rem">
    Status: <code class="code">{done ? "done" : "streaming…"}</code>
  </p>
</div>
