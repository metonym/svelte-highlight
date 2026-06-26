<script>
  import { highlight } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  let code = "const add = (a: number, b: number) => a + b;";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<button
  type="button"
  on:click={() => (code = "function hello(name: string) {}")}
>
  Update
</button>

<pre><code use:highlight={{ language: typescript, code }}></code></pre>
