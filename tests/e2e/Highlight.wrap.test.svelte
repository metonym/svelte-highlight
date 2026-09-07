<script lang="ts">
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const code =
    "const veryLongLine = 'this is a single very long line of code that should wrap instead of scrolling horizontally when the wrap prop is set on the Highlight component';";
</script>

<Highlight wrap language={typescript} {code} style="max-width: 200px" />
