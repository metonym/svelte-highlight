<script>
  import {
    createFenceAwareAppender,
    simulateStream,
  } from "@components/HighlightStream/stream-demo.js";
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import { onDestroy, onMount } from "svelte";
  import { HighlightStream, MarkdownStream } from "svelte-highlight";

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

  let text = "";
  let done = false;
  let stop = () => {};

  function run() {
    stop();
    text = "";
    done = false;
    const appendChunk = createFenceAwareAppender((chunk) => (text += chunk));
    stop = simulateStream(full, {
      onChunk: appendChunk,
      onDone: () => {
        appendChunk.flush();
        done = true;
      },
    });
  }

  onMount(run);
  onDestroy(() => stop());
</script>

<MarkdownStream {text} {done}>
  <svelte:fragment slot="fence" let:segment let:language>
    {#if segment.code}
      <HighlightStream
        code={segment.code}
        {language}
        done={done || !segment.open}
        caret={!done && segment.open}
        autoScroll
        class={THEME_MODULE_NAME}
      />
    {/if}
  </svelte:fragment>
</MarkdownStream>

<Button size="small" kind="tertiary" style="margin-top: 0.75rem" on:click={run}>
  Replay
</Button>
