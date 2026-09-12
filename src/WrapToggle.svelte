<script>
  /** @type {boolean} */
  export let wrap = false;

  /** @type {string} */
  export let text = "Wrap";

  /** @type {string} */
  export let pressedText = "Wrapped";
</script>

<button
  type="button"
  aria-pressed={wrap}
  aria-label={wrap ? pressedText : text}
  on:click={() => (wrap = !wrap)}
  {...$$restProps}
>
  <slot {wrap}>{text}</slot>
</button>

<style>
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    gap: var(--wrap-toggle-gap, 0.4em);
    padding: var(--wrap-toggle-padding, 0.5em 0.75em);
    background: var(--wrap-toggle-background, inherit);
    color: var(--wrap-toggle-color, inherit);
    border-radius: var(--wrap-toggle-border-radius, 4px);
    border: var(--wrap-toggle-border, none);
    font-size: var(--wrap-toggle-font-size, inherit);
  }
</style>
