<script>
  import { Highlight, HighlightAuto } from "svelte-highlight";
  import typescript from "svelte-highlight/src/languages/typescript";
  import atomOneDark from "svelte-highlight/src/styles/atom-one-dark";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<Highlight language={typescript} {code} />

<!-- <HighlightAuto langtag code={`body {\n  padding: 0;\n  color: red;\n}`} />
 -->