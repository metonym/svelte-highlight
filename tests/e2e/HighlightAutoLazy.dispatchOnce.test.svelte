<script lang="ts">
  import { HighlightAutoLazy } from "svelte-highlight";

  const code = "const add = (a, b) => a + b;";

  let langtag = false;
  let dispatchCount = 0;
  let language = "";
</script>

<button type="button" on:click={() => (langtag = !langtag)}>
  Toggle langtag
</button>

<HighlightAutoLazy
  {langtag}
  {code}
  languageNames={["javascript", "typescript"]}
  on:highlight={(e) => {
    dispatchCount++;
    language = e.detail.language;
  }}
/>

<p data-testid="dispatch-count">{dispatchCount}</p>
<p data-testid="language">{language}</p>
