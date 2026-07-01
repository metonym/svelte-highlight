<script>
  import Highlight from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<Highlight language={javascript} code="const x = 1;" />
