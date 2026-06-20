<script>
  import Highlight, { HighlightStyle } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import a11yDark from "svelte-highlight/styles/a11y-dark";
  import github from "svelte-highlight/styles/github";

  const code = "const add = (a, b) => a + b;";
</script>

<HighlightStyle theme={a11yDark} scopeClass="theme-a">
  <Highlight language={typescript} {code} />
</HighlightStyle>

<HighlightStyle theme={github} scopeClass="theme-b">
  <Highlight language={typescript} {code} />
</HighlightStyle>
