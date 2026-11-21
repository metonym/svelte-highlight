<script lang="ts">
  import { HighlightAuto } from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = "const x = 42;";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<HighlightAuto {code} languageNames={["javascript", "typescript"]} langtag />
