<script>
  /**
   * A controller from `createDiffController`.
   * @type {import("./diff-controller.js").DiffController}
   */
  export let diff;

  import { onMount } from "svelte";

  $: marks = $diff.marks();
  $: total = $diff.rows().length;

  let viewport = { start: 0, end: 0, count: 0 };

  /** @param {MouseEvent} event */
  function onClick(event) {
    const rect = /** @type {HTMLElement} */ (
      event.currentTarget
    ).getBoundingClientRect();
    diff.reveal(
      Math.floor(((event.clientY - rect.top) / rect.height) * total),
      "center",
    );
  }

  onMount(() => diff.on("viewport", (v) => (viewport = v)));
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="shl-diff-minimap shl-diff-theme"
  title="Changes in this file. Click to jump."
  role="presentation"
  on:click={onClick}
  {...$$restProps}
>
  {#each marks as mark (mark.rowIndex)}
    <span
      class="shl-diff-mark shl-diff-mark-{mark.kind}"
      class:shl-diff-mark-rejected={mark.decision === "rejected"}
      style="top: {mark.top * 100}%; height: max(2px, {mark.height * 100}%);"
    ></span>
  {/each}
  {#if total > 0}
    <span
      class="shl-diff-mark-viewport"
      style="top: {(viewport.start / total) * 100}%; height: {(Math.min(
        total,
        viewport.end - viewport.start,
      ) /
        total) *
        100}%;"
    ></span>
  {/if}
</div>

<style>
  .shl-diff-minimap {
    position: relative;
    flex: none;
    width: 10px;
    cursor: pointer;
    background: var(--shl-diff-rule, rgba(128, 128, 128, 0.15));
  }

  .shl-diff-mark {
    position: absolute;
    left: 1px;
    right: 1px;
  }

  .shl-diff-mark-add {
    background: var(--shl-diff-add-accent, #3fb950);
  }

  .shl-diff-mark-del {
    background: var(--shl-diff-del-accent, #f85149);
  }

  .shl-diff-mark-mod {
    background: linear-gradient(
      var(--shl-diff-del-accent, #f85149) 50%,
      var(--shl-diff-add-accent, #3fb950) 50%
    );
  }

  .shl-diff-mark-rejected {
    opacity: 0.3;
  }

  .shl-diff-mark-viewport {
    position: absolute;
    left: 0;
    right: 0;
    border: 1px solid color-mix(in srgb, currentColor 50%, transparent);
    pointer-events: none;
  }
</style>
