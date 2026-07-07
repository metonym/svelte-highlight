<script>
  import Highlight, { HighlightStyle } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const code = "const add = (a, b) => a + b;";
</script>

<HighlightStyle>
  <Highlight language={typescript} {code} />
</HighlightStyle>
