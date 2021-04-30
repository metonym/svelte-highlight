<script>
  import Highlight from "svelte-highlight";

  // TODO: direct import fails to build
  // only a wildcard import (*) will build correctly
  import * as typescript from "svelte-highlight/src/languages/typescript";
  import atomOneDark from "svelte-highlight/src/styles/atom-one-dark";

  const code = "const add = (a: number, b: number) => a + b;";

  console.log(typescript);
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<Highlight language="{typescript.default}" code="{code}" />
