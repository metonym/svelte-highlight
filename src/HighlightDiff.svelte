<script>
  /**
   * Original text.
   * @type {string}
   */
  export let before = "";

  /**
   * New text. With `streaming`, it may still be growing.
   * @type {string}
   */
  export let after = "";

  /**
   * A parsed file patch (from `parsePatch`) to render instead of
   * `before`/`after`. Lines outside its hunks show as unknown folds.
   * @type {import("./diff-edits.js").FilePatch | null}
   */
  export let patch = null;

  /** @type {import("./languages").LanguageType<string>} */
  export let language;

  /** @type {"unified" | "split"} */
  export let view = "unified";

  /** Unchanged lines kept around each change. */
  export let context = 3;

  /** Highlight changed words inside paired lines. */
  export let wordDiff = true;

  /** Treat lines that differ only in whitespace as unchanged. */
  export let ignoreWhitespace = false;

  /** Color blocks that moved instead of showing them as delete + add. */
  export let detectMoves = true;

  /**
   * `after` is still streaming in: the unreached end of `before` shows as
   * pending, and rows before the last sealed anchor never change.
   */
  export let streaming = false;

  /** While streaming, keep the newest row in view. */
  export let follow = true;

  /** Show accept/reject controls per change. */
  export let review = false;

  /** @type {import("./diff-controller.js").Annotation[]} */
  export let annotations = [];

  /** @type {"default" | "colorblind"} */
  export let palette = "default";

  /** Show the change overview strip. */
  export let minimap = true;

  /** Extra rows rendered above and below the viewport. */
  export let overscan = 10;

  /** Spaces per tab. */
  export let tabSize = 4;

  /**
   * The underlying controller, for composing with `DiffView`,
   * `DiffMinimap`, and `DiffStats`.
   */
  export const diff = createDiffController();

  import { createEventDispatcher, onMount } from "svelte";
  import DiffMinimap from "./DiffMinimap.svelte";
  import DiffView from "./DiffView.svelte";
  import { createDiffController } from "./diff-controller.js";

  const dispatch = createEventDispatcher();

  $: ({ class: _class, style: _style, ...rest } = $$restProps);

  $: diff.setOptions({
    language,
    view,
    context,
    wordDiff,
    ignoreWhitespace,
    detectMoves,
    annotations,
    tabSize,
  });
  $: if (patch) diff.setPatch(patch);
  else diff.update(before, after, { streaming });

  let lastStats = "";
  $: {
    const stats = $diff.stats();
    const key = `${stats.additions}:${stats.deletions}:${stats.changes}`;
    if (key !== lastStats) {
      lastStats = key;
      dispatch("stats", stats);
    }
  }

  onMount(() => {
    const offs = [
      diff.on("options", (o) => (view = o.view)),
      diff.on("navigate", (detail) => dispatch("navigate", detail)),
      diff.on("review", (detail) => dispatch("review", detail)),
    ];
    return () => {
      for (const off of offs) off();
    };
  });

  export const nextChange = () => diff.nextChange();
  export const prevChange = () => diff.prevChange();
  export const expandAll = () => diff.expandAll();
  export const collapseAll = () => diff.collapseAll();
  /** @param {"accepted" | "rejected"} decision */
  export const decideAll = (decision) => diff.decideAll(decision);
  export const getResult = () => diff.result();
  /** @param {{ oldPath?: string, newPath?: string }} [paths] */
  export const getPatch = (paths) => diff.patch(paths);
</script>

<div
  class="shl-diff-layout shl-diff-theme {_class ?? ""}"
  class:shl-diff-colorblind={palette === "colorblind"}
  style={_style}
>
  <DiffView
    {diff}
    {follow}
    {review}
    {palette}
    {overscan}
    style="height: 100%; flex: 1;"
    {...rest}
  />
  {#if minimap && $diff.marks().length}
    <DiffMinimap {diff} style="margin-bottom: 10px;" />
  {/if}
</div>

<style>
  .shl-diff-layout {
    display: flex;
    height: 400px;
    min-width: 0;
  }
</style>
