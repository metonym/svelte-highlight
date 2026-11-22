<script context="module">
  let instanceCount = 0;
  function nextInstanceId() {
    return ++instanceCount;
  }

  /**
   * The painter loads on first paint, so `"dom"`-only pages don't bundle
   * it. One load serves every instance.
   * @type {Promise<typeof import("./highlight-painter.js")> | undefined}
   */
  let painterLoad;

  /** @type {typeof import("./highlight-painter.js") | undefined} */
  let painterModule;

  function loadPainter() {
    // A static specifier, so bundlers split the module into its own chunk.
    painterLoad ??= import("./highlight-painter.js").then(
      (module) => (painterModule = module),
      (error) => {
        painterLoad = undefined;
        throw error;
      },
    );
    return painterLoad;
  }
</script>

<script>
  /** @type {import("./languages").LanguageType<string>} */
  export let language;

  /** @type {any} */
  export let code;

  /** @type {boolean} */
  export let langtag = false;

  /** @type {boolean} */
  export let wrap = false;

  /**
   * Rendering engine. `"css-highlights"` paints tokens via the CSS Custom
   * Highlight API over plain text instead of a `<span>` per token, falling
   * back to `"dom"` where unsupported. SSR renders `"dom"` markup; the swap
   * happens after mount. No effect with a custom default slot.
   * @type {"dom" | "css-highlights"}
   */
  export let engine = "dom";

  /**
   * Theme CSS or `ThemePalette` for `::highlight()` rules (`"css-highlights"`
   * only). Each token gets the color and background the `"dom"` engine's
   * markup would get. Bold and italic are dropped. Without a theme, the
   * text stays plain.
   * @type {string | import("./theme.d.ts").ThemePalette | undefined}
   */
  export let theme = undefined;

  import { afterUpdate, createEventDispatcher, onMount } from "svelte";
  import { resolveEngine } from "./css-highlights.js";
  import LangTag from "./LangTag.svelte";
  import { ensureRegistered, registry } from "./registry.js";

  /**
   * @typedef {{ highlighted: string; events: import("./engine.d.ts").ScopeEvent[] }} HighlightEventDetail
   * @type {import("svelte").EventDispatcher<{ highlight: HighlightEventDetail }>}
   */
  const dispatch = createEventDispatcher();

  // Distinct from HighlightEditable's numeric ids, so names never clash.
  const highlightPrefix = `hljs-highlight-${nextInstanceId()}`;
  /** @type {string} */
  let highlighted = "";

  /** @type {import("./engine.d.ts").ScopeEvent[]} */
  let events = [];

  /** @type {import("./engine.d.ts").ScopeEvent[] | undefined} */
  let lastDispatchedEvents;

  /** @type {HTMLElement | undefined} */
  let codeElement;

  let mounted = false;

  /** The painter module, once loaded. */
  let painterApi = painterModule;

  /** @type {ReturnType<typeof import("./highlight-painter.js").createHighlightPainter> | undefined} */
  let painter;

  $: resolvedEngineValue = resolveEngine(engine);
  // Wait for mount, so hydration sees the same markup as SSR.
  $: wantsPainting = mounted && resolvedEngineValue === "css-highlights";
  $: if (wantsPainting && !painterApi) {
    loadPainter().then(
      (module) => {
        // Unmounted meanwhile: paint nothing. Otherwise the reactive
        // statements below paint the latest props.
        if (mounted) painterApi = module;
      },
      () => {
        // Keep the "dom" markup.
      },
    );
  }
  // When painting, LangTag gets an empty `highlighted` and renders `code` as
  // plain text. Until the painter loads, keep the "dom" markup, so the code
  // never shows as plain text without colors.
  $: painting = wantsPainting && painterApi !== undefined;
  $: if (painting && painterApi && !painter) {
    painter = painterApi.createHighlightPainter(highlightPrefix, outsideColor);
  } else if (!painting && painter) {
    painter.clear();
    painter = undefined;
  }
  $: cssHighlightStyle = painter ? painter.update(events, theme) : "";

  /** The color the `<pre>` inherits, for themes that use `currentColor`. */
  function outsideColor() {
    const outside = codeElement?.closest("pre")?.parentElement;
    return outside ? getComputedStyle(outside).color : null;
  }

  afterUpdate(() => {
    if (events !== lastDispatchedEvents) {
      lastDispatchedEvents = events;
      dispatch("highlight", { highlighted, events });
    }
    painter?.paint(codeElement);
  });

  onMount(() => {
    mounted = true;
    return () => {
      mounted = false;
      painter?.clear();
    };
  });

  /**
   * The engine on screen. `"css-highlights"` once it paints. `"dom"`
   * before mount, where `CSS.highlights` is missing, until the color
   * resolver loads, for good if that load fails, and with a custom
   * default slot.
   */
  export function resolvedEngine() {
    return painting && codeElement ? "css-highlights" : "dom";
  }

  $: {
    ensureRegistered(language);
    const source = String(code ?? "");
    const result = registry.highlight(source, { language: language.name });
    highlighted = result.value;
    events = result.events;
  }
</script>

<svelte:head
  >{#if cssHighlightStyle}
    {@html cssHighlightStyle}
  {/if}</svelte:head
>

<slot {highlighted} {langtag} {wrap} languageName={language.name} {events}>
  <LangTag
    {...$$restProps}
    languageName={language.name}
    {langtag}
    {wrap}
    highlighted={painting ? "" : highlighted}
    {code}
    bind:codeElement
  />
</slot>
