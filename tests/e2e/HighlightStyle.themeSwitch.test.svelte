<script>
  import Highlight, { HighlightStyle } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import a11yDark from "svelte-highlight/styles/a11y-dark";
  import github from "svelte-highlight/styles/github";
  import atomOneDark from "svelte-highlight/themes/atom-one-dark";
  import atomOneLight from "svelte-highlight/themes/atom-one-light";
  import "svelte-highlight/themes/base.css";

  const code = "const add = (a, b) => a + b;";

  let themeB = a11yDark;
</script>

<button
  type="button"
  data-testid="switch-theme"
  on:click={() => (themeB = github)}
>
  Switch
</button>

<HighlightStyle theme={a11yDark} data-testid="a" let:scopeClass>
  <span data-testid="a-scope">{scopeClass}</span>
  <Highlight language={typescript} {code} />
</HighlightStyle>

<HighlightStyle theme={themeB} data-testid="b" let:scopeClass>
  <span data-testid="b-scope">{scopeClass}</span>
  <Highlight language={typescript} {code} />
</HighlightStyle>

<HighlightStyle
  light={atomOneLight}
  dark={atomOneDark}
  mode="dark"
  data-testid="palette-pair"
>
  <Highlight language={typescript} {code} />
</HighlightStyle>
