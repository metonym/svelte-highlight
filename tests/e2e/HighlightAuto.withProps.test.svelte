<script lang="ts">
  import { HighlightAuto } from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  export let code: string = "";
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<HighlightAuto {code} langtag />

