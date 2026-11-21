<script lang="ts">
  import { HighlightAutoLazy } from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = "@media (max-width: 600px) {\n  body { background: #000; }\n}";

  let dispatchCount = 0;
  let language = "";
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<HighlightAutoLazy
  {code}
  langtag
  on:highlight={(e) => {
    dispatchCount++;
    language = e.detail.language;
  }}
/>

<p data-testid="dispatch-count">{dispatchCount}</p>
<p data-testid="language">{language}</p>
