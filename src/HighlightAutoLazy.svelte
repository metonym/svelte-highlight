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

  import { afterUpdate, createEventDispatcher, onMount } from "svelte";
  import { highlightAutoIfLoaded, highlightAutoLazy } from "./auto-detect.js";
  import { escapeHtml, TEXT } from "./engine.js";

  /**
   * @typedef {{ highlighted: string; language: string; events: import("./engine.d.ts").ScopeEvent[]; secondBest?: { language: string | undefined; relevance: number } }} HighlightEventDetail
   * @type {import("svelte").EventDispatcher<{ highlight: HighlightEventDetail}>}
   */
  const dispatch = createEventDispatcher();

  /** @type {string} */
  let highlighted = "";

  /** @type {string} */
  let language = "";

  /** @type {import("./engine.d.ts").ScopeEvent[]} */
  let events = [];

  /** @type {{ language: string | undefined; relevance: number } | undefined} */
  let secondBest;

  // True once `events` holds a detection result, not the plain-text
  // placeholder. Only results dispatch `highlight`.
  let detected = false;

  /** @type {import("./engine.d.ts").ScopeEvent[] | undefined} */
  let lastDispatchedEvents;

  afterUpdate(() => {
    if (detected && events !== lastDispatchedEvents) {
      lastDispatchedEvents = events;
      dispatch("highlight", { highlighted, language, events, secondBest });
    }
  });

  /** @param {string} source */
  function showPlainText(source) {
    highlighted = escapeHtml(source);
    language = "";
    events = [{ t: TEXT, v: source }];
    secondBest = undefined;
    detected = false;
  }

  /** @param {import("./engine.d.ts").HighlightResult} result */
  function showResult(result) {
    highlighted = result.value;
    language = result.language ?? "";
    events = result.events;
    secondBest = result.secondBest;
    detected = true;
  }

  // Bumped on every run, so a slow load for older `code` can't overwrite
  // the result for newer `code`.
  let run = 0;

  /**
   * @param {string} source
   * @param {string[] | undefined} names
   */
  async function detect(source, names) {
    const id = ++run;
    const options = { languageNames: names };
    const ready = highlightAutoIfLoaded(source, options);
    if (ready) {
      showResult(ready);
      return;
    }
    showPlainText(source);
    const result = await highlightAutoLazy(source, options);
    if (id === run) showResult(result);
  }

  // Server and first client render both show plain text, so hydration
  // matches. Detection starts after mount.
  let mounted = false;
  onMount(() => {
    mounted = true;
  });

  $: source = String(code ?? "");
  $: if (!mounted) showPlainText(source);
  $: if (mounted) detect(source, languageNames);
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
