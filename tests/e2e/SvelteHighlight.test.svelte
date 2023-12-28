<script>
  import { HighlightSvelte } from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = `<button on:click={() => { console.log(0); }}>Click me</button>`;
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<HighlightSvelte {code} />
