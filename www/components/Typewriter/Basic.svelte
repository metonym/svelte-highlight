<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import Highlight, { HighlightSvelte, Typewriter } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const code = `const greet = (name) => {
  return \`Hello, \${name}!\`;
};`;

  const snippet = `<script>
  import Highlight, { Typewriter } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";

  const code = "const add = (a, b) => a + b;";
<\/script>

<svelte:head>
  {@html github}
<\/svelte:head>

<Highlight language={typescript} {code} let:highlighted>
  <Typewriter {highlighted} />
</Highlight>`;

  // Bump to remount and replay typing.
  let runId = 0;
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

{#key runId}
  <Highlight language={typescript} {code} let:highlighted>
    <Typewriter {highlighted} class={THEME_MODULE_NAME} />
  </Highlight>
{/key}

<Button
  size="small"
  kind="tertiary"
  style="margin-top: 0.75rem"
  on:click={() => (runId += 1)}
>
  Replay
</Button>
