<script lang="ts">
  import { AnsiOutput } from "svelte-highlight";

  const ESC = "\x1b";

  // White background with explicit white text, white background with the
  // default (no) foreground, and a blue background with white text.
  const whiteOnWhite = `${ESC}[47;37mWW${ESC}[0m`;
  const whiteBg = `${ESC}[47mBG${ESC}[0m`;
  const blueWhite = `${ESC}[44;37mBL${ESC}[0m`;

  const text = `${whiteOnWhite} ${whiteBg} ${blueWhite}`;
</script>

<div data-testid="auto">
  <AnsiOutput {text} />
</div>

<div data-testid="off">
  <AnsiOutput text={whiteOnWhite} autoContrast={false} />
</div>
