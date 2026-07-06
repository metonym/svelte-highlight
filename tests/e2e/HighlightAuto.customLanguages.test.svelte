<script lang="ts">
  import { HighlightAuto } from "svelte-highlight";
  import svelte from "svelte-highlight/languages/svelte";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code =
    "{#each items as item}\n  <li>{item}</li>\n{/each}\n\n{#if $state(active)}\n  <p>{item}</p>\n{/if}";

  let detectedLanguage = "";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<HighlightAuto
  {code}
  languages={[svelte]}
  langtag
  on:highlight={(e) => (detectedLanguage = e.detail.language)}
/>

<output data-testid="detected-language">{detectedLanguage}</output>
