<script>
  import LangTag from "./LangTag.svelte";

  /** @type {any} */
  export let code;

  /** @type {(import("./languages").LanguageName | (string & {}))[] | undefined} */
  export let languageNames = undefined;

  /** @type {boolean} */
  export let langtag = false;

  /** @type {boolean} */
  export let wrap = false;

  import { afterUpdate, createEventDispatcher } from "svelte";
  import { registerAll } from "./engine.js";
  // Static import keeps detection synchronous (SSR-safe).
  import allLanguages from "./languages/all.js";
  import { registry } from "./registry.js";

  /**
   * @typedef {{ highlighted: string; language: string; events: import("./engine.d.ts").ScopeEvent[]; secondBest?: { language: string | undefined; relevance: number } }} HighlightEventDetail
   * @type {import("svelte").EventDispatcher<{ highlight: HighlightEventDetail}>}
   */
  const dispatch = createEventDispatcher();

  let allRegistered = false;
  function ensureAllRegistered() {
    if (allRegistered) return;
    // Not registry.get(name): alias collisions (ini aliasing toml) would skip the real grammar.
    for (const language of allLanguages) registerAll(registry, language);
    allRegistered = true;
  }

  /** @type {string} */
  let highlighted = "";

  /** @type {string} */
  let language = "";

  /** @type {import("./engine.d.ts").ScopeEvent[]} */
  let events = [];

  /** @type {{ language: string | undefined; relevance: number } | undefined} */
  let secondBest;

  /** @type {import("./engine.d.ts").ScopeEvent[] | undefined} */
  let lastDispatchedEvents;

  afterUpdate(() => {
    if (events !== lastDispatchedEvents) {
      lastDispatchedEvents = events;
      dispatch("highlight", { highlighted, language, events, secondBest });
    }
  });

  $: {
    ensureAllRegistered();
    const source = String(code ?? "");
    ({
      value: highlighted,
      language = "",
      events,
      secondBest,
    } = registry.highlightAuto(source, languageNames));
  }
</script>

<slot {highlighted} {langtag} {wrap} languageName={language} {events}>
  <LangTag
    {...$$restProps}
    languageName={language}
    {langtag}
    {wrap}
    {highlighted}
    {code}
  />
</slot>
