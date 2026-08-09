<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import {
    Button,
    Select,
    SelectItem,
    Slider,
    Toggle,
  } from "carbon-components-svelte";
  import Highlight, {
    CodeWindow,
    easeInCubic,
    easeInOutCubic,
    easeInOutQuad,
    easeInOutSine,
    easeInQuad,
    easeInSine,
    easeOutCubic,
    easeOutQuad,
    easeOutSine,
    linear,
    Typewriter,
  } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const code = `async function load(url) {
  const res = await fetch(url);
  return res.json();
}`;

  const EASINGS = {
    linear,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeInCubic,
    easeOutCubic,
    easeInOutCubic,
    easeInSine,
    easeOutSine,
    easeInOutSine,
  };

  let speed = 40;
  let play = true;
  let done = false;
  let runId = 0;
  let easingName = "linear";

  $: easing = EASINGS[easingName];

  function replay() {
    done = false;
    play = true;
    runId += 1;
  }
</script>

{#key runId}
  <CodeWindow variant="macos" title="load.ts">
    <Highlight language={typescript} {code} let:highlighted>
      <Typewriter
        {highlighted}
        {speed}
        {play}
        {easing}
        class={THEME_MODULE_NAME}
        --caret-color="#2996cf"
        --caret-width="2px"
        on:done={() => (done = true)}
      />
    </Highlight>
  </CodeWindow>
{/key}

<div
  style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 1.5rem; margin-top: 1rem"
>
  <Slider
    bind:value={speed}
    min={10}
    max={120}
    step={5}
    labelText="Speed (ms / character)"
  />
  <Select labelText="Easing" bind:selected={easingName}>
    {#each Object.keys(EASINGS) as name}
      <SelectItem value={name} />
    {/each}
  </Select>
  <Toggle
    bind:toggled={play}
    labelText="Playback"
    labelA="Paused"
    labelB="Playing"
  />
  <Button size="small" kind="tertiary" on:click={replay}>Replay</Button>
  <p class="label-01" style="margin-bottom: 0.5rem">
    Status: <code class="code">{done ? "done" : "revealing…"}</code>
  </p>
</div>
