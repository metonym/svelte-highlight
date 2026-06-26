<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import Highlight, { HighlightStyle, HighlightSvelte } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";
  import githubDark from "svelte-highlight/styles/github-dark";

  const code = "const add = (a: number, b: number) => a + b;";

  const snippet = `<script>
  import { Highlight, HighlightStyle } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";
  import githubDark from "svelte-highlight/styles/github-dark";

  const code = "const add = (a: number, b: number) => a + b;";
<\/script>

<HighlightStyle light={github} dark={githubDark}>
  <Highlight language={typescript} {code} />
</HighlightStyle>`;

  const selectorSnippet = `<HighlightStyle light={github} dark={githubDark} mode={'[data-theme="dark"]'}>
  <Highlight language={typescript} {code} />
</HighlightStyle>`;
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<p class="mb-5">
  Renders following your system <code class="code">prefers-color-scheme</code>:
</p>

<div class="mb-5">
  <HighlightStyle light={github} dark={githubDark}>
    <Highlight language={typescript} {code} />
  </HighlightStyle>
</div>

<p class="mb-5">
  Or gate the dark block behind a CSS selector for a manual toggle:
</p>

<HighlightSvelte code={selectorSnippet} class={THEME_MODULE_NAME} />
