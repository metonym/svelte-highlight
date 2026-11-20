<script>
  /**
   * Accessible name and tooltip. Required for an icon-only button.
   * @type {string}
   */
  export let label;

  /**
   * Set for a toggle button. Sets `aria-pressed` and the pressed style.
   * @type {boolean | undefined}
   */
  export let pressed = undefined;

  /**
   * Renders a link instead of a button.
   * @type {string | undefined}
   */
  export let href = undefined;

  // A link can't be pressed, so only a button gets aria-pressed.
  $: stateAttrs = href ? {} : { type: "button", "aria-pressed": pressed };
</script>

<svelte:element
  this={href ? "a" : "button"}
  {href}
  aria-label={label}
  {...stateAttrs}
  title={label}
  on:click
  {...$$restProps}
  class={["shl-toolbar-button", $$restProps.class].filter(Boolean).join(" ")}
  ><slot /></svelte:element
>

<style>
  .shl-toolbar-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--toolbar-button-gap, 0.4em);
    min-width: var(--toolbar-button-size, 2em);
    height: var(--toolbar-button-size, 2em);
    padding: var(--toolbar-button-padding, 0.3em);
    background: var(--toolbar-button-background, transparent);
    color: var(
      --toolbar-button-color,
      color-mix(in srgb, currentColor 72%, transparent)
    );
    border-radius: var(--toolbar-button-border-radius, 6px);
    border: var(--toolbar-button-border, none);
    font: inherit;
    font-size: var(--toolbar-button-font-size, inherit);
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color 120ms ease,
      color 120ms ease;
  }

  .shl-toolbar-button:hover {
    background: var(
      --toolbar-button-hover-background,
      color-mix(in srgb, currentColor 12%, transparent)
    );
    color: inherit;
  }

  .shl-toolbar-button[aria-pressed="true"],
  .shl-toolbar-button:active {
    background: var(
      --toolbar-button-pressed-background,
      color-mix(in srgb, currentColor 18%, transparent)
    );
    color: inherit;
  }

  .shl-toolbar-button:focus-visible {
    color: inherit;
    outline: 2px solid currentColor;
    outline-offset: 1px;
  }

  @media (prefers-reduced-motion: reduce) {
    .shl-toolbar-button {
      transition: none;
    }
  }
</style>
