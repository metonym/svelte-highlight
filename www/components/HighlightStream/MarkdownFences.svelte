<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import { onDestroy, onMount } from "svelte";
  import { HighlightStream, loadLanguage } from "svelte-highlight";
  import { createFenceSplitter } from "svelte-highlight/fence";
  import { simulateStream } from "./stream-demo.js";

  const full = `Here's a helper that adds two numbers:

\`\`\`javascript
function add(a, b) {
  return a + b;
}
\`\`\`

And a typed version, using the \`ts\` alias:

\`\`\`ts
function add(a: number, b: number): number {
  return a + b;
}
\`\`\`

Let me know if you'd like more examples!`;

  const splitter = createFenceSplitter();
  let segments = splitter.segments();
  let done = false;
  let stop = () => {};

  function run() {
    stop();
    splitter.reset();
    segments = splitter.segments();
    done = false;
    stop = simulateStream(full, {
      onChunk: (chunk) => {
        splitter.append(chunk);
        segments = splitter.segments();
      },
      onDone: () => (done = true),
    });
  }

  onMount(run);
  onDestroy(() => stop());
</script>

{#each segments as segment (segment.id)}
  {#if segment.kind === "text"}
    <p style="white-space: pre-wrap">{segment.text}</p>
  {:else}
    {#await loadLanguage(segment.lang ?? "plaintext") then grammar}
      <HighlightStream
        language={grammar}
        code={segment.code}
        done={!segment.open}
        class={THEME_MODULE_NAME}
      />
    {/await}
  {/if}
{/each}

<Button size="small" kind="tertiary" style="margin-top: 0.75rem" on:click={run}>
  Replay
</Button>
