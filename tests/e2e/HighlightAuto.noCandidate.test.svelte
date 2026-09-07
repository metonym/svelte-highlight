<script lang="ts">
  import { HighlightAuto } from "svelte-highlight";

  const code = "some plain text with no recognizable grammar";

  let dispatchCount = 0;
  let languageJson = "";
</script>

<HighlightAuto
  {code}
  languageNames={["not-a-registered-language"]}
  on:highlight={(e) => {
    dispatchCount++;
    languageJson = JSON.stringify(e.detail.language);
  }}
/>

<p data-testid="dispatch-count">{dispatchCount}</p>
<p data-testid="language">{languageJson}</p>
