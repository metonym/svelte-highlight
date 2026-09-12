<script>
  /** @type {string | undefined} */
  export let languageName = undefined;

  /** @type {string} */
  export let title = "";

  /** @type {boolean} */
  export let sticky = true;

  /** @type {string | undefined} */
  export let label = undefined;
</script>

<div
  class="shl-toolbar"
  role="toolbar"
  aria-label={label}
  style:position={sticky ? "sticky" : "static"}
  style:top={sticky ? "0" : undefined}
  {...$$restProps}
>
  <div class="shl-toolbar-start">
    {#if languageName}
      <span class="shl-toolbar-badge" data-language={languageName}
        >{languageName}</span
      >
    {/if}
    {#if title}
      <span class="shl-toolbar-title" {title}>{title}</span>
    {/if}
    <slot name="start" />
  </div>
  <div class="shl-toolbar-end"><slot /></div>
</div>

<style>
  .shl-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--toolbar-gap, 0.5em);
    min-height: var(--toolbar-height, 2.5em);
    padding: var(--toolbar-padding, 0.5em 1em);
    background: var(--toolbar-background, inherit);
    color: var(--toolbar-color, inherit);
    border-bottom: var(--toolbar-border, 1px solid rgba(0, 0, 0, 0.1));
    font-family: var(--toolbar-font-family, inherit);
    font-size: var(--toolbar-font-size, inherit);
    z-index: var(--toolbar-z-index, 2);
  }

  .shl-toolbar-start,
  .shl-toolbar-end {
    display: flex;
    align-items: center;
    gap: var(--toolbar-gap, 0.5em);
    min-width: 0;
  }

  .shl-toolbar-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .shl-toolbar-badge {
    background: var(--langtag-background, inherit);
    color: var(--langtag-color, inherit);
    border-radius: var(--langtag-border-radius, 0);
    padding: var(--langtag-padding, 1em);
    font-size: var(--langtag-font-size, inherit);
  }
</style>
