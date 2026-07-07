<script lang="ts">
  import { AnsiOutput } from "svelte-highlight";

  const ESC = "\x1b";

  // An OSC 8 hyperlink wrapping "docs".
  const text = `see ${ESC}]8;;https://example.com${ESC}\\docs${ESC}]8;;${ESC}\\ for more`;
</script>

<AnsiOutput {text} data-testid="ansi" />
