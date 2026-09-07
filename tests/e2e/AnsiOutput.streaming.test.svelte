<script lang="ts">
  import { AnsiOutput } from "svelte-highlight";

  const ESC = "\x1b";

  // Chunk boundaries split mid-SGR-parameter ("...[3" | "2m...") and
  // mid-OSC-8-URI ("...;;https://exa" | "mple.com...").
  const CHUNKS = [
    `${ESC}[3`,
    `2mgreen${ESC}[0m `,
    `see ${ESC}]8;;https://exa`,
    `mple.com${ESC}\\docs${ESC}]8;;${ESC}\\`,
  ];
  const fullText = CHUNKS.join("");

  let text = "";
  let chunksSent = 0;
  let done = false;

  function appendChunk() {
    if (chunksSent >= CHUNKS.length) return;
    text += CHUNKS[chunksSent];
    chunksSent += 1;
    if (chunksSent >= CHUNKS.length) done = true;
  }
</script>

<button type="button" data-testid="append-chunk" on:click={appendChunk}>
  Append chunk
</button>

<AnsiOutput {text} data-testid="streamed" />
{#if done}
  <AnsiOutput text={fullText} data-testid="reference" />
{/if}
