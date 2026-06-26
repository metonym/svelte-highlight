<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import Highlight, {
    CodeWindow,
    HighlightStyle,
    HighlightSvelte,
  } from "svelte-highlight";
  import bash from "svelte-highlight/languages/bash";
  import json from "svelte-highlight/languages/json";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  import githubDark from "svelte-highlight/styles/github-dark";
  import nord from "svelte-highlight/styles/nord";

  const jsonCode = `{
  "name": "svelte-highlight",
  "version": "7.12.0",
  "type": "module"
}`;

  const bashCode = `$ npm install svelte-highlight

added 1 package in 1.2s
$ npm run build`;

  const tsCode = "const add = (a: number, b: number) => a + b;";

  const snippet = `<script>
  import Highlight, { CodeWindow } from "svelte-highlight";
  import json from "svelte-highlight/languages/json";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = '{ "name": "svelte-highlight" }';
<\/script>

<svelte:head>
  {@html atomOneDark}
<\/svelte:head>

<CodeWindow variant="macos" title="package.json">
  <Highlight language={json} {code} />
</CodeWindow>`;

  const customSnippet = `<CodeWindow
  variant="macos"
  title="example.ts"
  --window-radius="12px"
  --window-background="#0d1117"
  --titlebar-background="#161b22"
  --titlebar-color="#8b949e"
>
  <Highlight language={typescript} {code} />
</CodeWindow>`;

  // Each example pairs a variant with its own language and theme. Distinct
  // themes mean distinct scope classes, so each HighlightStyle injects its
  // own stylesheet.
  const examples = [
    {
      variant: "macos",
      title: "package.json",
      language: json,
      code: jsonCode,
      theme: atomOneDark,
    },
    {
      variant: "terminal",
      title: "bash",
      language: bash,
      code: bashCode,
      theme: nord,
    },
    {
      variant: "plain",
      title: "example.ts",
      language: typescript,
      code: tsCode,
      theme: githubDark,
    },
  ];
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<p class="mb-5">
  Switch the <code class="code">variant</code> prop between
  <code class="code">"macos"</code>, <code class="code">"terminal"</code>, and
  <code class="code">"plain"</code>. Each block below also pairs it with a
  different language and theme:
</p>

{#each examples as { variant, title, language, code, theme }}
  <div class="mb-5">
    <HighlightStyle {theme}>
      <CodeWindow {variant} {title}>
        <Highlight {language} {code} />
      </CodeWindow>
    </HighlightStyle>
  </div>
{/each}

<p class="mb-5">
  Every part of the chrome is themable with style props. The window is square by
  default; give it rounded corners with
  <code class="code">--window-radius</code>
  and recolor the body and title bar:
</p>

<div class="mb-5">
  <HighlightSvelte code={customSnippet} class={THEME_MODULE_NAME} />
</div>

<HighlightStyle theme={githubDark}>
  <CodeWindow
    variant="macos"
    title="example.ts"
    --window-radius="12px"
    --window-background="#0d1117"
    --titlebar-background="#161b22"
    --titlebar-color="#8b949e"
  >
    <Highlight language={typescript} code={tsCode} />
  </CodeWindow>
</HighlightStyle>
