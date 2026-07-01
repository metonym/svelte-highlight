<script>
  import Highlight, { HighlightStyle } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import a11yDark from "svelte-highlight/styles/a11y-dark";
  import github from "svelte-highlight/styles/github";
</script>

<HighlightStyle theme={a11yDark}>
  <Highlight language={javascript} code="const x = 1;" />
</HighlightStyle>

<HighlightStyle theme={github}>
  <Highlight language={javascript} code="const y = 2;" />
</HighlightStyle>
