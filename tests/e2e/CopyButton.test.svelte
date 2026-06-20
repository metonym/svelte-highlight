<script lang="ts">
  import Highlight, { CopyButton } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<div style="position: relative">
  <Highlight language={typescript} {code} />
  <CopyButton {code} timeout={1000} />
</div>
