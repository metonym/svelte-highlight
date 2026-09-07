<script lang="ts">
  import Highlight, { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import horizonDark from "svelte-highlight/styles/horizon-dark";
  import { splitLines } from "../../src/split-lines.js";

  // 100 lines so the full document needs 3 digits for its gutter, while the
  // 2-line window alone (without lineCount) would only need 2 -- exercising
  // lineCount actually overriding the window's own length for sizing.
  const code = Array.from(
    { length: 100 },
    (_, i) => `const line${i} = ${i};`,
  ).join("\n");
</script>

<svelte:head> {@html horizonDark} </svelte:head>

<Highlight language={typescript} {code} let:highlighted>
  {@const allLines = splitLines(highlighted)}
  <div data-testid="windowed">
    <LineNumbers
      lines={allLines.slice(2, 4)}
      startingLineNumber={3}
      lineCount={allLines.length}
    />
  </div>
  <div data-testid="full">
    <LineNumbers {highlighted} startingLineNumber={3} />
  </div>
</Highlight>
