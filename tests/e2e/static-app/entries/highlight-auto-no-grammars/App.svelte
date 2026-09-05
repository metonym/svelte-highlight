<script>
  import { HighlightAuto } from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<HighlightAuto code="const x = 1;" />
