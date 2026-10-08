<script>
  /**
   * A controller from `createDiffController`.
   * @type {import("./diff-controller.js").DiffController}
   */
  export let diff;

  import { onMount } from "svelte";

  $: stats = $diff.stats();

  /** @type {{ index: number, count: number } | null} */
  let position = null;

  onMount(() => diff.on("navigate", (detail) => (position = detail)));
</script>

<span class="shl-diff-stats shl-diff-theme" {...$$restProps}>
  <span class="shl-diff-stats-add">+{stats.additions}</span>
  <span class="shl-diff-stats-del">−{stats.deletions}</span>
  <span>
    · {stats.changes}
    {stats.changes === 1 ? "change" : "changes"}
    {#if position}
      · {position.index + 1} of {position.count}
    {/if}
  </span>
</span>

<style>
  .shl-diff-stats {
    font-variant-numeric: tabular-nums;
  }

  .shl-diff-stats-add {
    color: var(--shl-diff-add-accent, #3fb950);
  }

  .shl-diff-stats-del {
    color: var(--shl-diff-del-accent, #f85149);
  }
</style>
