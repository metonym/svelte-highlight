<script lang="ts">
  import { HighlightSvelte } from "svelte-highlight";

  const code =
    "<script>\n  let count = 0;\n<\\/script>\n<button>{count}</button>\n";

  let langtag = false;
  let dispatchCount = 0;
</script>

<button type="button" on:click={() => (langtag = !langtag)}>
  Toggle langtag
</button>

<HighlightSvelte {langtag} {code} on:highlight={() => dispatchCount++} />

<p data-testid="dispatch-count">{dispatchCount}</p>
