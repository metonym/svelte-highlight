<script>
  import { highlight } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  let tick = 0;
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<button type="button" on:click={() => (tick += 1)}>Update</button>

<pre
><code use:highlight={{ language: javascript, tick }}>const s = 1;</code></pre>
