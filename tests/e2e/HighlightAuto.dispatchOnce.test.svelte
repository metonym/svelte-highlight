<script lang="ts">
  import { HighlightAuto } from "svelte-highlight";

  const code = "const add = (a, b) => a + b;";

  let langtag = false;
  let dispatchCount = 0;
</script>

<button type="button" on:click={() => (langtag = !langtag)}>
  Toggle langtag
</button>

<HighlightAuto
  {langtag}
  {code}
  languageNames={["javascript", "typescript"]}
  on:highlight={() => dispatchCount++}
/>

<p data-testid="dispatch-count">{dispatchCount}</p>
