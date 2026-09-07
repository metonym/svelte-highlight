<script lang="ts">
  import { HighlightAuto } from "svelte-highlight";
  import { registry } from "svelte-highlight/registry";

  const code = "const add = (a, b) => a + b;";
  const languageNames = ["javascript", "typescript"];

  let dispatchLanguage = "";
  let dispatchSecondBestJson = "";
</script>

<HighlightAuto
  {code}
  {languageNames}
  on:highlight={(e) => {
    dispatchLanguage = e.detail.language;
    dispatchSecondBestJson = JSON.stringify(e.detail.secondBest) ?? "";
  }}
/>

<p data-testid="expected-second-best">
  {dispatchLanguage
    ? JSON.stringify(registry.highlightAuto(code, languageNames).secondBest)
    : ""}
</p>
<p data-testid="dispatch-second-best">{dispatchSecondBestJson}</p>
