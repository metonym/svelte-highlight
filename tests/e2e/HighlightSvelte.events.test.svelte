<script lang="ts">
  import { HighlightSvelte } from "svelte-highlight";
  import svelte from "svelte-highlight/languages/svelte";
  import { ensureRegistered, registry } from "svelte-highlight/registry";

  const code =
    "<script>\n  let count = 0;\n<\\/script>\n<button>{count}</button>\n";

  ensureRegistered(svelte);
  const expectedEventsJson = JSON.stringify(
    registry.highlight(code, { language: "svelte" }).events,
  );

  let slotEventsJson = "";
  let dispatchEventsJson = "";

  function captureSlotEvents(events: unknown) {
    slotEventsJson = JSON.stringify(events);
    return "";
  }
</script>

<HighlightSvelte
  {code}
  let:events
  on:highlight={(e) => (dispatchEventsJson = JSON.stringify(e.detail.events))}
>
  {captureSlotEvents(events)}
</HighlightSvelte>

<p data-testid="expected-events">{expectedEventsJson}</p>
<p data-testid="slot-events">{slotEventsJson}</p>
<p data-testid="dispatch-events">{dispatchEventsJson}</p>
