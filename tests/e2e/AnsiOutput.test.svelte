<script lang="ts">
  import { AnsiOutput, CodeWindow } from "svelte-highlight";

  const ESC = "\x1b";

  // A line exercising bold, a standard color, a bright color and a reset.
  const text =
    `${ESC}[1;32m$${ESC}[0m npm run build\n` +
    `${ESC}[31merror${ESC}[0m: ${ESC}[33mwarning${ESC}[0m here\n` +
    `${ESC}[94mdone${ESC}[0m`;
</script>

<CodeWindow variant="terminal" title="bash" data-testid="window">
  <AnsiOutput {text} data-testid="ansi" />
</CodeWindow>
