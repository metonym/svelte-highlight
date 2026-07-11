<script lang="ts">
  import { HighlightAuto } from "svelte-highlight";
  import { registry } from "svelte-highlight/registry";

  const code = "const add = (a, b) => a + b;";

  let slotEventsJson = "";
  let dispatchEventsJson = "";
  let dispatchLanguage = "";

  function captureSlotEvents(events: unknown) {
    slotEventsJson = JSON.stringify(events);
    return "";
  }
</script>

<HighlightAuto
  {code}
  languageNames={["javascript", "typescript"]}
  let:events
  on:highlight={(e) => {
    dispatchEventsJson = JSON.stringify(e.detail.events);
    dispatchLanguage = e.detail.language;
  }}
>
  {captureSlotEvents(events)}
</HighlightAuto>

<p data-testid="expected-events">
  {dispatchLanguage
    ? JSON.stringify(
        registry.highlight(code, { language: dispatchLanguage }).events,
      )
    : ""}
</p>
<p data-testid="slot-events">{slotEventsJson}</p>
<p data-testid="dispatch-events">{dispatchEventsJson}</p>
