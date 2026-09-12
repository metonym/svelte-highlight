<script lang="ts">
  import Highlight, { CodeWindow } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<CodeWindow variant="macos" title="example.ts" data-testid="macos">
  <Highlight language={typescript} {code} />
</CodeWindow>

<CodeWindow variant="terminal" title="bash" data-testid="terminal">
  <Highlight language={typescript} {code} />
</CodeWindow>

<CodeWindow variant="plain" title="plain.ts" data-testid="plain">
  <Highlight language={typescript} {code} />
</CodeWindow>

<div style="width: 160px">
  <CodeWindow
    variant="macos"
    title="a-very-long-file-name-that-overflows.ts"
    data-testid="narrow-macos"
  >
    <Highlight language={typescript} {code} />
  </CodeWindow>
</div>

<div style="width: 160px">
  <CodeWindow
    variant="terminal"
    title="a-very-long-file-name-that-overflows.ts"
    data-testid="narrow-terminal"
  >
    <Highlight language={typescript} {code} />
  </CodeWindow>
</div>
