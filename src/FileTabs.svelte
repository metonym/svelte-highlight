<script context="module">
  let uid = 0;
</script>

<script>
  /** @type {string[]} */
  export let files;

  /** @type {string} */
  export let active = files[0];

  import { afterUpdate, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const baseId = `svelte-highlight-file-tabs-${uid++}`;

  /** @type {HTMLDivElement} */
  let root;

  /** @type {HTMLButtonElement[]} */
  let tabs = [];

  $: activeIndex = files.indexOf(active);

  /** @param {string} file */
  function selectTab(file) {
    if (file === active) return;
    active = file;
    dispatch("change", { active });
  }

  /**
   * Roving-tabindex keyboard navigation per the WAI-ARIA tabs pattern.
   * @param {KeyboardEvent} event
   * @param {number} index
   */
  function handleKeydown(event, index) {
    const lastIndex = files.length - 1;
    let nextIndex = index;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = index === lastIndex ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = index === 0 ? lastIndex : index - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectTab(files[nextIndex]);
    tabs[nextIndex]?.focus();
  }

  // Copy the highlighted block's background and text color onto the active tab
  // so it matches whatever highlight.js theme is loaded. Falls back to
  // transparent/inherit when `.hljs` isn't painted yet (e.g. SSR).
  afterUpdate(() => {
    const code = root?.querySelector(".tabpanel .hljs");

    if (code) {
      const { backgroundColor, color } = getComputedStyle(code);
      root.style.setProperty(
        "--tab-active-resolved-background",
        backgroundColor,
      );
      root.style.setProperty("--tab-active-resolved-color", color);
    }
  });
</script>

<div class="file-tabs" bind:this={root} {...$$restProps}>
  <div role="tablist" class="tablist">
    {#each files as file, index (file)}
      <button
        bind:this={tabs[index]}
        type="button"
        role="tab"
        id="{baseId}-tab-{index}"
        class="tab"
        class:active={file === active}
        aria-controls="{baseId}-panel"
        tabindex={file === active ? 0 : -1}
        {...{
          // Spread keeps the dynamic boolean out of Biome's static
          // `useValidAriaValues` check, which misreads templated values.
          "aria-selected": file === active,
        }}
        on:click={() => selectTab(file)}
        on:keydown={(event) => handleKeydown(event, index)}
      >
        {file}
      </button>
    {/each}
  </div>

  <div
    role="tabpanel"
    id="{baseId}-panel"
    class="tabpanel"
    aria-labelledby="{baseId}-tab-{activeIndex}"
  >
    <slot {active} />
  </div>
</div>

<style>
  .file-tabs {
    display: flex;
    flex-direction: column;
  }

  .tablist {
    display: flex;
    gap: var(--file-tabs-gap, 0);
    background: var(--file-tabs-background, inherit);
    overflow-x: auto;
  }

  .tab {
    display: inline-flex;
    align-items: center;
    padding: var(--tab-padding, 0.5em 1em);
    font: inherit;
    color: var(--tab-color, inherit);
    background: var(--tab-background, transparent);
    border: 0;
    cursor: pointer;
    white-space: nowrap;
    opacity: var(--tab-inactive-opacity, 0.55);
    transition:
      opacity 0.1s ease,
      background-color 0.1s ease;
  }

  .tab:hover {
    opacity: 1;
  }

  .tab.active {
    opacity: 1;
    color: var(--tab-active-color, var(--tab-active-resolved-color, inherit));
    background: var(
      --tab-active-background,
      var(--tab-active-resolved-background, transparent)
    );
  }

  .tab:focus-visible {
    outline: var(--tab-focus-outline, 2px solid currentColor);
    outline-offset: -2px;
  }
</style>
