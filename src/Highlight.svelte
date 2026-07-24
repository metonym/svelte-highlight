<script>
  /** @type {import("./languages").LanguageType<string>} */
  export let language;

  /** @type {any} */
  export let code;

  /** @type {boolean} */
  export let langtag = false;

  /**
   * Rendering engine. `"css-highlights"` paints tokens via the CSS Custom
   * Highlight API (`CSS.highlights`) over a single text node instead of
   * wrapping each token in a `<span>`, so a highlighted block never grows
   * a `<span>` per token — a 5,000-token file adds zero extra elements.
   * Falls back to `"dom"` silently where `CSS.highlights` is unavailable
   * (SSR, or a browser without support); check what was actually used
   * with the `resolvedEngine()` method.
   *
   * SSR always renders the `"dom"` engine's span markup — there is no
   * `CSS.highlights` on the server. With `"css-highlights"` resolved
   * client-side, the swap to a single text node plus painted ranges
   * happens after hydration, mirroring `HighlightEditable`.
   *
   * Only takes effect when this component renders its own default
   * markup: if a custom default slot is provided (e.g. to feed
   * `LineNumbers`), there is no `Highlight`-owned `<code>` element to
   * paint into and this prop has no effect — consume `events` directly
   * (see `svelte-highlight/engine`) to build a custom renderer instead.
   *
   * Colors only: `::highlight()` doesn't support `font-style`/
   * `font-weight`/`text-decoration` across browsers, so bold/italic scopes
   * render plain in this mode.
   * @type {"dom" | "css-highlights"}
   */
  export let engine = "dom";

  /**
   * Theme CSS from `svelte-highlight/styles/<theme>`, or a `ThemePalette`
   * from `svelte-highlight/themes/<theme>`, used only in `"css-highlights"`
   * mode to generate `::highlight()` rules. Colors only
   * (`color`/`background-color`); other declarations are dropped.
   * @type {string | import("./theme.d.ts").ThemePalette | undefined}
   */
  export let theme = undefined;

  import { afterUpdate, createEventDispatcher, onMount } from "svelte";
  import {
    createHighlightPainter,
    instanceHighlightRules,
    nextInstanceId,
    resolveEngine,
  } from "./css-highlights.js";
  import { toRanges } from "./engine.js";
  import LangTag from "./LangTag.svelte";
  import { ensureRegistered, registry } from "./registry.js";

  /**
   * @typedef {{ highlighted: string; events: import("./engine.d.ts").ScopeEvent[] }} HighlightEventDetail
   * @type {import("svelte").EventDispatcher<{ highlight: HighlightEventDetail }>}
   */
  const dispatch = createEventDispatcher();

  const instanceId = nextInstanceId();
  const painter = createHighlightPainter(instanceId);

  /** @type {string} */
  let highlighted = "";

  /** @type {import("./engine.d.ts").ScopeEvent[]} */
  let events = [];

  /** @type {HTMLElement | undefined} */
  let codeElement;

  let previousEngine;

  $: resolvedEngineValue = resolveEngine(engine);

  $: cssHighlightStyle =
    resolvedEngineValue === "css-highlights" && theme !== undefined
      ? `<style>${instanceHighlightRules(theme, instanceId)}</style>`
      : "";

  $: source = typeof code === "string" ? code : String(code ?? "");

  $: {
    ensureRegistered(language);
    const result = registry.highlight(source, { language: language.name });
    highlighted = result.value;
    events = result.events;
  }

  // Bypasses LangTag's own `{@html highlighted}` markup with a single text
  // node plus CSS.highlights ranges. Runs after every update (not just
  // code/language/theme changes matter here — an engine-only toggle must
  // also repaint), since LangTag may skip re-writing innerHTML when
  // `highlighted` itself didn't change this cycle.
  function paintCssHighlights() {
    painter.clear();
    if (!codeElement) return;
    codeElement.textContent = source;
    const textNode = codeElement.firstChild;
    if (!(textNode instanceof Text)) return;
    painter.paintNode(textNode, toRanges(events), 0, source.length);
  }

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted, events });

    if (resolvedEngineValue === "css-highlights") {
      paintCssHighlights();
    } else if (previousEngine === "css-highlights" && codeElement) {
      painter.clear();
      codeElement.innerHTML = highlighted;
    }
    previousEngine = resolvedEngineValue;
  });

  onMount(() => () => painter.clear());

  /** The engine actually in use: `engine`, or `"dom"` if it was requested but unsupported. */
  export function resolvedEngine() {
    return resolvedEngineValue;
  }
</script>

<svelte:head
  >{#if cssHighlightStyle}
    {@html cssHighlightStyle}
  {/if}</svelte:head
>

<slot {highlighted} {langtag} languageName={language.name} {events}>
  <LangTag
    {...$$restProps}
    languageName={language.name}
    {langtag}
    {highlighted}
    {code}
    bind:codeElement
  />
</slot>
