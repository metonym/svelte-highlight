<script lang="ts">
  import { AnsiOutput } from "svelte-highlight";

  const ESC = "\x1b";

  // An OSC 8 hyperlink wrapping "docs".
  const text = `see ${ESC}]8;;https://example.com${ESC}\\docs${ESC}]8;;${ESC}\\ for more`;

  // A javascript: URI, which must render as plain text, not a link.
  const unsafeText = `click ${ESC}]8;;javascript:alert(1)${ESC}\\here${ESC}]8;;${ESC}\\`;
</script>

<AnsiOutput {text} data-testid="ansi" />
<AnsiOutput text={unsafeText} data-testid="ansi-unsafe" />
