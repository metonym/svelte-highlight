<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import {
    Button,
    Select,
    SelectItem,
    Slider,
    Toggle,
  } from "carbon-components-svelte";
  import { HighlightDiff } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { tsAfter, tsBefore } from "./samples.js";

  /** @type {"unified" | "split"} */
  let view = "split";
  let context = 3;
  let wordDiff = true;
  let ignoreWhitespace = false;
  let detectMoves = true;
  let minimap = true;
  /** @type {"default" | "colorblind"} */
  let palette = "default";

  /** @type {HighlightDiff} */
  let ref;
  let stats = { additions: 0, deletions: 0, changes: 0 };
  let position = "";
  let copied = "";

  async function copyPatch() {
    await navigator.clipboard.writeText(
      ref.getPatch({ oldPath: "a/cache.ts", newPath: "b/cache.ts" }),
    );
    copied = "Patch copied";
    setTimeout(() => (copied = ""), 1500);
  }
</script>

<div class="controls">
  <Select inline size="sm" labelText="View" bind:selected={view}>
    <SelectItem value="split" text="Split" />
    <SelectItem value="unified" text="Unified" />
  </Select>
  <Select inline size="sm" labelText="Palette" bind:selected={palette}>
    <SelectItem value="default" text="Red / green" />
    <SelectItem value="colorblind" text="Colorblind (blue / orange)" />
  </Select>
  <Slider bind:value={context} min={0} max={10} labelText="Context lines" />
  <Toggle size="sm" bind:toggled={wordDiff} labelText="Word diff" />
  <Toggle
    size="sm"
    bind:toggled={ignoreWhitespace}
    labelText="Ignore whitespace"
  />
  <Toggle size="sm" bind:toggled={detectMoves} labelText="Detect moves" />
  <Toggle size="sm" bind:toggled={minimap} labelText="Minimap" />
</div>

<div class="controls">
  <Button size="small" kind="tertiary" on:click={() => ref.prevChange()}
    >Prev change</Button
  >
  <Button size="small" kind="tertiary" on:click={() => ref.nextChange()}
    >Next change</Button
  >
  <Button size="small" kind="ghost" on:click={() => ref.expandAll()}
    >Expand all</Button
  >
  <Button size="small" kind="ghost" on:click={() => ref.collapseAll()}
    >Collapse all</Button
  >
  <Button size="small" kind="ghost" on:click={copyPatch}>Copy as patch</Button>
  <span class="label-01">
    <span class="add">+{stats.additions}</span>
    <span class="del">−{stats.deletions}</span>
    · {stats.changes} changes {position} {copied}
  </span>
</div>

<HighlightDiff
  bind:this={ref}
  bind:view
  before={tsBefore}
  after={tsAfter}
  language={typescript}
  {context}
  {wordDiff}
  {ignoreWhitespace}
  {detectMoves}
  {minimap}
  {palette}
  class={THEME_MODULE_NAME}
  style="height: 480px"
  on:stats={(e) => (stats = e.detail)}
  on:navigate={(e) =>
    (position = `· change ${e.detail.index + 1} of ${e.detail.count}`)}
/>

<p class="label-01 hint">
  Click the diff, then use the keyboard: <kbd>n</kbd>/<kbd>p</kbd>
  next/previous change,
  <kbd>e</kbd>/<kbd>c</kbd>
  expand/collapse folds, <kbd>v</kbd> toggle view. In split view, a selection
  stays on the side where it started, so copy gives one file's text. Scroll
  sideways over each side on its own.
</p>

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1rem 1.5rem;
    margin-bottom: 1rem;
  }

  .add {
    color: #3fb950;
  }

  .del {
    color: #f85149;
  }

  .hint {
    margin-top: 0.75rem;
  }

  kbd {
    font-family: monospace;
    padding: 0 4px;
    border: 1px solid #555;
    border-radius: 3px;
  }
</style>
