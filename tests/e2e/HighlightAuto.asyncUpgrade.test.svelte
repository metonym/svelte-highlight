<script lang="ts">
  import { HighlightAuto } from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code =
    'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("hello world")\n}\n';

  let dispatchCount = 0;
  let lastLanguage = "";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<HighlightAuto
  {code}
  langtag
  on:highlight={(e) => {
    dispatchCount++;
    lastLanguage = e.detail.language;
  }}
/>

<p data-testid="dispatch-count">{dispatchCount}</p>
<p data-testid="last-language">{lastLanguage}</p>
