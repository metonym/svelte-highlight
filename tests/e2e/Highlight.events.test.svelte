<script lang="ts">
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { ensureRegistered, registry } from "svelte-highlight/registry";

  const code = "const add = (a: number, b: number) => a + b;";

  ensureRegistered(typescript);
  const expectedEventsJson = JSON.stringify(
    registry.highlight(code, { language: "typescript" }).events,
  );

  let slotEventsJson = "";
  let dispatchEventsJson = "";

  function captureSlotEvents(events: unknown) {
    slotEventsJson = JSON.stringify(events);
    return "";
  }
</script>

<Highlight
  language={typescript}
  {code}
  let:events
  on:highlight={(e) => (dispatchEventsJson = JSON.stringify(e.detail.events))}
>
  {captureSlotEvents(events)}
</Highlight>

<p data-testid="expected-events">{expectedEventsJson}</p>
<p data-testid="slot-events">{slotEventsJson}</p>
<p data-testid="dispatch-events">{dispatchEventsJson}</p>
