<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import Highlight, { HighlightStyle, HighlightSvelte } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import a11yDark from "svelte-highlight/styles/a11y-dark";
  import github from "svelte-highlight/styles/github";

  const code = "const add = (a: number, b: number) => a + b;";

  const snippet = `<script>
  import { Highlight, HighlightStyle } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import a11yDark from "svelte-highlight/styles/a11y-dark";
  import github from "svelte-highlight/styles/github";

  const code = "const add = (a: number, b: number) => a + b;";
<\/script>

<HighlightStyle theme={a11yDark}>
  <Highlight language={typescript} {code} />
</HighlightStyle>

<HighlightStyle theme={github}>
  <Highlight language={typescript} {code} />
</HighlightStyle>`;
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<p class="mb-5">Both themes render on the same page, scoped to each block:</p>

<HighlightStyle theme={a11yDark}>
  <Highlight language={typescript} {code} />
</HighlightStyle>

<HighlightStyle theme={github}>
  <Highlight language={typescript} {code} />
</HighlightStyle>
