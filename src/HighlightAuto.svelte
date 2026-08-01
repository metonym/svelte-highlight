<script>
  import LangTag from "./LangTag.svelte";

  /** @type {any} */
  export let code;

  /** @type {(import("./languages").LanguageName | (string & {}))[] | undefined} */
  export let languageNames = undefined;

  /**
   * Explicit language modules to detect among, synchronously (SSR included) -
   * the escape hatch for a deterministic bundle and today's old
   * always-synchronous behavior. Combines with `languageNames`, which
   * further filters this list.
   * @type {import("./languages").LanguageType<string>[] | undefined}
   */
  export let languages = undefined;

  /** @type {boolean} */
  export let langtag = false;

  import { afterUpdate, createEventDispatcher, onMount } from "svelte";
  import { detectLanguage } from "./auto-detect.js";
  import { escapeHtml, TEXT } from "./engine.js";
  import { ensureRegistered, registry } from "./registry.js";

  /**
   * @typedef {{ highlighted: string; language: string; events: import("./engine.d.ts").ScopeEvent[] }} HighlightEventDetail
   * @type {import("svelte").EventDispatcher<{ highlight: HighlightEventDetail}>}
   */
  const dispatch = createEventDispatcher();

  /** @type {string} */
  let highlighted = "";

  /** @type {string} */
  let language = "";

  /** @type {import("./engine.d.ts").ScopeEvent[]} */
  let events = [];

  // `languages` path only: dispatched every recompute, same as today. The
  // default (async) path dispatches for itself from `runDetection`, once per
  // resolved detection - not from here, or the plain-text interim render
  // (also handled by this same afterUpdate, since `highlighted` is truthy
  // for it too) would dispatch a spurious extra event.
  afterUpdate(() => {
    if (languages && highlighted)
      dispatch("highlight", { highlighted, language, events });
  });

  $: source = typeof code === "string" ? code : String(code ?? "");

  // Bounded sync path: exactly today's old default behavior, scoped to a
  // caller-chosen pool. Runs identically during SSR and in the browser.
  $: if (languages) {
    for (const entry of languages) ensureRegistered(entry);
    let subset = languages.map((entry) => entry.name);
    if (languageNames)
      subset = subset.filter((name) => languageNames.includes(name));
    ({
      value: highlighted,
      language = "",
      events,
    } = registry.highlightAuto(source, subset));
  }

  // Default path baseline: plain escaped text, synchronously - the only
  // thing SSR ever sees (dynamic import can't run in Svelte's synchronous
  // SSR), and the browser's first paint until detection resolves. Recomputed
  // on every `code` change so an in-flight detection's eventual result can
  // never overwrite what's now stale input (see `runDetection`'s token guard).
  $: if (!languages) {
    highlighted = escapeHtml(source);
    language = "";
    events = [{ t: TEXT, v: source }];
  }

  let detectToken = 0;
  /**
   * @param {string} detectSource
   * @param {(string)[] | undefined} names
   */
  async function runDetection(detectSource, names) {
    const token = ++detectToken;
    const result = await detectLanguage(detectSource, { languageNames: names });
    if (token !== detectToken) return; // superseded by a later `code`/prop change
    if (result.language) {
      const full = registry.highlight(detectSource, {
        language: result.language,
      });
      highlighted = full.value;
      language = result.language;
      events = full.events;
    }
    dispatch("highlight", { highlighted, language, events });
  }

  // CSR only (onMount never runs during SSR): kicks off tier-0/tier-1
  // detection once mounted, and again on every subsequent `code`/
  // `languageNames` change - `mounted` is a dependency of this block purely
  // to defer its first run until after mount.
  let mounted = false;
  onMount(() => {
    mounted = true;
  });
  $: if (!languages && mounted) runDetection(source, languageNames);
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
