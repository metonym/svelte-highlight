<script lang="ts">
  import { HighlightAuto } from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  let code = "body { background: #000; }";
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<HighlightAuto {code} langtag={true} />
