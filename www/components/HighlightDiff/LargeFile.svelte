<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button, Select, SelectItem } from "carbon-components-svelte";
  import { diffStats, diffTexts, HighlightDiff } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { generateLargePair } from "./samples.js";

  let size = "50000";
  $: pair = generateLargePair(Number(size), Math.round(Number(size) / 150));
  $: t0 = performance.now();
  $: stats = diffStats(diffTexts(pair.before, pair.after));
  $: elapsed = (void stats, performance.now() - t0);

  /** @type {HighlightDiff} */
  let ref;
  let renderedRows = 0;

  /** @param {HTMLElement} node */
  function countRows(node) {
    const update = () =>
      (renderedRows = node.querySelectorAll(".shl-diff-row").length);
    const observer = new MutationObserver(update);
    observer.observe(node, { childList: true, subtree: true });
    update();
    return { destroy: () => observer.disconnect() };
  }
</script>

<div class="controls">
  <Select inline size="sm" labelText="Lines" bind:selected={size}>
    <SelectItem value="5000" text="5,000" />
    <SelectItem value="50000" text="50,000" />
    <SelectItem value="200000" text="200,000" />
  </Select>
  <Button size="small" kind="tertiary" on:click={() => ref.expandAll()}
    >Expand all</Button
  >
  <Button size="small" kind="ghost" on:click={() => ref.collapseAll()}
    >Collapse all</Button
  >
  <Button size="small" kind="ghost" on:click={() => ref.nextChange()}
    >Next change</Button
  >
  <span class="label-01">
    {Number(size).toLocaleString()}
    lines · {stats.changes} changes (+{stats.additions}
    −{stats.deletions}) · diffed in {elapsed.toFixed(0)} ms ·
    {renderedRows}
    rows in the DOM
  </span>
</div>

<div use:countRows>
  <HighlightDiff
    bind:this={ref}
    before={pair.before}
    after={pair.after}
    language={typescript}
    class={THEME_MODULE_NAME}
    style="height: 420px"
  />
</div>

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1rem 1.5rem;
    margin-bottom: 1rem;
  }
</style>
