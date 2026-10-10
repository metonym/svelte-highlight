<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import {
    createDiffController,
    DiffStats,
    DiffView,
    FileTabs,
    parsePatch,
  } from "svelte-highlight";
  import rust from "svelte-highlight/languages/rust";
  import { commits } from "./samples.js";

  const files = parsePatch(commits[0]?.patch ?? "").filter((f) =>
    f.newPath.endsWith(".rs"),
  );
  const names = files.map((f) => f.newPath.split("/").pop() ?? f.newPath);
  let active = names[0] ?? "";

  const diff = createDiffController({
    language: rust,
    view: "split",
    context: 2,
  });
  $: diff.setPatch(files[names.indexOf(active)] ?? null);
  $: options = $diff.options();
</script>

<p class="label-01 mb-3">
  <code class="code">FileTabs</code>
  + <code class="code">DiffView</code> +
  <code class="code">DiffStats</code>, with a toolbar that only talks to the
  controller.
</p>

<FileTabs files={names} bind:active class={THEME_MODULE_NAME} />
<div class="toolbar">
  <DiffStats {diff} />
  <span>
    <button
      type="button"
      on:click={() =>
        diff.setOptions({
          view: options.view === "split" ? "unified" : "split",
        })}
    >
      {options.view}
    </button>
    <button
      type="button"
      on:click={() => diff.setOptions({ wordDiff: !options.wordDiff })}
    >
      words: {options.wordDiff ? "on" : "off"}
    </button>
    <button type="button" on:click={() => diff.prevChange()}>prev</button>
    <button type="button" on:click={() => diff.nextChange()}>next</button>
  </span>
</div>
<DiffView {diff} class={THEME_MODULE_NAME} style="height: 300px" />

<style>
  .toolbar {
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    background: #262626;
    font-size: 12px;
  }

  .toolbar button {
    margin-left: 6px;
    background: #393939;
    color: inherit;
    border: 0;
    padding: 2px 8px;
    cursor: pointer;
  }
</style>
