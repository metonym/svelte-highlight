<script>
  import Highlight, { HighlightStyle } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import a11yDark from "svelte-highlight/styles/a11y-dark";

  const code = "const add = (a, b) => a + b;";
</script>

<HighlightStyle theme={a11yDark}>
  <Highlight language={typescript} {code} />
</HighlightStyle>

<HighlightStyle theme={a11yDark}>
  <Highlight language={typescript} {code} />
</HighlightStyle>

<HighlightStyle theme={a11yDark}>
  <Highlight language={typescript} {code} />
</HighlightStyle>
