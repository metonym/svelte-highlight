<script lang="ts">
  import { HighlightAuto } from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = "const x = 42;";

  let secondBestLanguage = "";
  let hasSecondBest = false;
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<HighlightAuto
  {code}
  languageNames={["javascript", "typescript"]}
  langtag
  on:highlight={(e) => {
    hasSecondBest = e.detail.secondBest !== undefined;
    secondBestLanguage = e.detail.secondBest?.language ?? "";
  }}
/>

<output data-testid="has-second-best">{hasSecondBest}</output>
<output data-testid="second-best-language">{secondBestLanguage}</output>
