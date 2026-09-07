<script lang="ts">
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  let dispatchCount = 0;
  let highlightedJson = "";
  let eventsJson = "";
</script>

<Highlight
  language={typescript}
  code=""
  on:highlight={(e) => {
    dispatchCount++;
    highlightedJson = JSON.stringify(e.detail.highlighted);
    eventsJson = JSON.stringify(e.detail.events);
  }}
/>

<p data-testid="dispatch-count">{dispatchCount}</p>
<p data-testid="highlighted">{highlightedJson}</p>
<p data-testid="events">{eventsJson}</p>
