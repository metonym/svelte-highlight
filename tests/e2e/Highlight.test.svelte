<script>
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  let toggle = true;

  const code = "const add = (a: number, b: number) => a + b;";
  const code2 = "function hello(name: string){\n\treturn `Hello ${name}!`;\n}";
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<button type="button" on:click={() => (toggle = !toggle)}>Toggle</button>

<Highlight langtag language={typescript} code={toggle ? code : code2} />
