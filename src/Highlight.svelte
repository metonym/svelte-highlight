<script>
  /** @type {import("./languages").LanguageType<string>} */
  export let language;

  /** @type {any} */
  export let code;

  /** @type {boolean} */
  export let langtag = false;

  import { afterUpdate, createEventDispatcher } from "svelte";
  import LangTag from "./LangTag.svelte";
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
    ensureRegistered(language);
    const source = typeof code === "string" ? code : String(code ?? "");
    const result = registry.highlight(source, { language: language.name });
    highlighted = result.value;
    events = result.events;
  }
</script>

<slot {highlighted} {langtag} languageName={language.name} {events}>
  <LangTag
    {...$$restProps}
    languageName={language.name}
    {langtag}
    {highlighted}
    {code}
  />
</slot>
