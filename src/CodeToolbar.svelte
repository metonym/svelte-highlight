<script>
  /** @type {string | undefined} */
  export let languageName = undefined;

  /** @type {string} */
  export let title = "";

  /** @type {boolean} */
  export let sticky = true;

  /** @type {string | undefined} */
  export let label = undefined;

  import { setContext } from "svelte";

  // CopyButton and WrapToggle read this to switch to the toolbar's
  // inline icon-button style.
  setContext("svelte-highlight:code-toolbar", true);
</script>

<div
  role="toolbar"
  aria-label={label}
  {...$$restProps}
  class={["shl-toolbar hljs", $$restProps.class].filter(Boolean).join(" ")}
  class:shl-toolbar-sticky={sticky}
>
  <div class="shl-toolbar-start">
    {#if title}
      <span class="shl-toolbar-title" {title}>{title}</span>
    {/if}
    {#if languageName}
      <span class="shl-toolbar-badge" data-language={languageName}
        >{languageName}</span
      >
    {/if}
    <slot name="start" />
  </div>
  <div class="shl-toolbar-end"><slot /></div>
</div>

<style>
  /* The root carries the `hljs` class, so the theme's `.hljs` rule gives
     the bar the same background and text color as the code. This rule
     sets neither, so the theme always wins. */
  .shl-toolbar {
    position: relative;
    isolation: isolate;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--toolbar-gap, 0.75em);
    min-height: var(--toolbar-height, 2.75em);
    padding: var(--toolbar-padding, 0.25em 0.375em 0.25em 1em);
    border-bottom: var(
      --toolbar-border,
      1px solid color-mix(in srgb, currentColor 14%, transparent)
    );
    font-family: var(
      --toolbar-font-family,
      system-ui,
      -apple-system,
      "Segoe UI",
      Roboto,
      sans-serif
    );
    font-size: var(--toolbar-font-size, 0.8125em);
    font-weight: 400;
    line-height: 1.25;
    overflow: visible;
  }

  /* A faint wash of the text color over the theme background sets the bar
     apart from the code on light and dark themes. */
  .shl-toolbar::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background: var(
      --toolbar-background,
      color-mix(in srgb, currentColor 5%, transparent)
    );
  }

  /* Used only when no theme styles the bar. Zero specificity, so any
     theme's `.hljs` rule overrides it. A pinned bar must be opaque. */
  :global(:where(.shl-toolbar)) {
    background-color: Canvas;
    color: CanvasText;
  }

  .shl-toolbar-sticky {
    position: sticky;
    top: 0;
    z-index: var(--toolbar-z-index, 3);
  }

  .shl-toolbar-start,
  .shl-toolbar-end {
    display: flex;
    align-items: center;
    min-width: 0;
    color: var(--toolbar-color, inherit);
  }

  .shl-toolbar-start {
    gap: var(--toolbar-gap, 0.75em);
  }

  .shl-toolbar-end {
    flex-shrink: 0;
    gap: 0.25em;
  }

  .shl-toolbar-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .shl-toolbar-badge {
    flex-shrink: 0;
    padding: var(--langtag-padding, 0.375em 0.625em);
    border-radius: var(--langtag-border-radius, 999px);
    background: var(
      --langtag-background,
      color-mix(in srgb, currentColor 10%, transparent)
    );
    color: var(
      --langtag-color,
      color-mix(in srgb, currentColor 72%, transparent)
    );
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: var(--langtag-font-size, 0.875em);
    line-height: 1;
    letter-spacing: 0.01em;
    /* Trims the line box to the x-height, so the glyphs sit in the
       optical center of the pill. Ignored where unsupported. */
    text-box: trim-both ex alphabetic;
  }
</style>
