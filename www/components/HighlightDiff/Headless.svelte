<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import {
    buildRows,
    diffTexts,
    HighlightSvelte,
    toUnifiedPatch,
    wordDiff,
  } from "svelte-highlight";
  import { languageSamples } from "./samples.js";

  const [before, after] = languageSamples.python;
  const state = diffTexts(before, after);
  const rows = buildRows(state, { context: 1 });

  const snippet = `<script>
  import { buildRows, diffTexts, toUnifiedPatch, wordDiff } from "svelte-highlight";

  const state = diffTexts(before, after);    // blocks, lines, ids
  const rows = buildRows(state, { context: 1, view: "unified" });
  const patch = toUnifiedPatch(state);
  const words = wordDiff("print(fib(10))", "print(fib(90))");
<\/script>`;
</script>

<HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />

<div class="cols">
  <div>
    <h6>state.blocks</h6>
    <pre>{JSON.stringify(state.blocks, null, 1)}</pre>
  </div>
  <div>
    <h6>buildRows(state, {"{"} context: 1 {"}"})</h6>
    <pre>{rows
    .map(
      (r) =>
        `${r.kind.padEnd(8)} old=${r.old ?? "-"} new=${r.new ?? "-"}${r.count ? ` count=${r.count}` : ""}`,
    )
    .join("\n")}</pre>
  </div>
  <div>
    <h6>toUnifiedPatch(state)</h6>
    <pre>{toUnifiedPatch(state)}</pre>
    <h6>wordDiff(…)</h6>
    <pre>{JSON.stringify(wordDiff("print(fib(10))", "print(fib(90))"))}</pre>
  </div>
</div>

<style>
  .cols {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }

  pre {
    font-family: ui-monospace, Menlo, monospace;
    max-height: 300px;
    overflow: auto;
    font-size: 11px;
    background: #161616;
    padding: 0.5rem;
  }
</style>
