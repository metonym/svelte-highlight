<script>
  import Highlight from "svelte-highlight";
  import css from "svelte-highlight/languages/css";
  import javascript from "svelte-highlight/languages/javascript";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<Highlight language={javascript} code="const x = 1;" />
<Highlight language={typescript} code="const y: number = 2;" />
<Highlight language={css} code={".a { color: red; }"} />
