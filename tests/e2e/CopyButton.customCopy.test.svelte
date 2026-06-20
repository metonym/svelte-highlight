<script lang="ts">
  import Highlight, { CopyButton } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = "const add = (a: number, b: number) => a + b;";

  let copied = "";
  let count = 0;

  /** Override the copy behavior; bypasses the native Clipboard API. */
  function copy(value: string) {
    copied = value;
    count += 1;
  }
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<div style="position: relative">
  <Highlight language={typescript} {code} />
  <CopyButton
    {code}
    {copy}
    timeout={1000}
    --copy-size="60px"
    --copy-z-index="5"
  />
</div>

<output data-testid="copied">{copied}</output>
<output data-testid="count">{count}</output>
