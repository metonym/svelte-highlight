<script>
  import LangTag from "./LangTag.svelte";

  /** @type {any} */
  export let code;

  /** @type {boolean} */
  export let langtag = false;

  import { afterUpdate, createEventDispatcher } from "svelte";
  import svelte from "./languages/svelte";
  import { ensureRegistered, registry } from "./registry.js";

  /**
   * @typedef {{ highlighted: string; events: import("./engine.d.ts").ScopeEvent[] }} HighlightEventDetail
   * @type {import("svelte").EventDispatcher<{ highlight: HighlightEventDetail }>}
   */
  const dispatch = createEventDispatcher();

  /** @type {string} */
  let highlighted = "";

  /** @type {import("./engine.d.ts").ScopeEvent[]} */
  let events = [];

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted, events });
  });

  $: {
    ensureRegistered(svelte);
    const source = typeof code === "string" ? code : String(code ?? "");
    const result = registry.highlight(source, { language: svelte.name });
    highlighted = result.value;
    events = result.events;
  }
</script>

<slot {highlighted} {langtag} languageName="svelte" {events}>
  <LangTag
    {...$$restProps}
    languageName="svelte"
    {langtag}
    {highlighted}
    {code}
  />
</slot>
