<script>
  import LangTag from "./LangTag.svelte";

  /** @type {any} */
  export let code;

  /** @type {(import("./languages").LanguageName | (string & {}))[] | undefined} */
  export let languageNames = undefined;

  /** @type {boolean} */
  export let langtag = false;

  import { afterUpdate, createEventDispatcher } from "svelte";
  import { registerAll } from "./engine.js";
  // All shipped grammars so auto-detect sees customs too. Static import keeps
  // detection synchronous (SSR-safe).
  import allLanguages from "./languages/all.js";
  import { registry } from "./registry.js";

  /**
   * @typedef {{ highlighted: string; language: string; events: import("./engine.d.ts").ScopeEvent[] }} HighlightEventDetail
   * @type {import("svelte").EventDispatcher<{ highlight: HighlightEventDetail}>}
   */
  const dispatch = createEventDispatcher();

  let allRegistered = false;
  function ensureAllRegistered() {
    if (allRegistered) return;
    // registerAll, not registry.get(name), so alias collisions (e.g. ini
    // aliasing toml) do not skip the real grammar. See registerAll in engine.js.
    for (const language of allLanguages) registerAll(registry, language);
    allRegistered = true;
  }

  /** @type {string} */
  let highlighted = "";

  /** @type {string} */
  let language = "";

  /** @type {import("./engine.d.ts").ScopeEvent[]} */
  let events = [];

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted, language, events });
  });

  $: {
    ensureAllRegistered();
    const source = typeof code === "string" ? code : String(code ?? "");
    ({
      value: highlighted,
      language = "",
      events,
    } = registry.highlightAuto(source, languageNames));
  }
</script>

<slot {highlighted} {langtag} languageName={language} {events}>
  <LangTag
    {...$$restProps}
    languageName={language}
    {langtag}
    {highlighted}
    {code}
  />
</slot>
