<script>
  import {
    createDiffController,
    DiffMinimap,
    DiffStats,
    DiffView,
  } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";

  const before =
    Array.from({ length: 300 }, (_, i) => `let v${i} = ${i};`).join("\n") +
    "\n";
  const after = before
    .replace("let v10 = 10;", "let v10 = 1000;")
    .replace("let v280 = 280;", "let v280 = 0;");

  const diff = createDiffController({
    language: javascript,
    annotations: [{ side: "new", line: 11, body: "Custom note" }],
  });
  diff.update(before, after);

  let clicked = -1;
</script>

<DiffStats {diff} data-testid="stats" />
<div style="display: flex">
  <DiffView {diff} data-testid="view" style="height: 240px; flex: 1">
    <div slot="note" let:note data-testid="note">{note.body}</div>
    <button
      type="button"
      slot="actions"
      let:change
      data-testid="action"
      on:click={() => (clicked = change)}
    >
      act {change}
    </button>
  </DiffView>
  <DiffMinimap {diff} data-testid="minimap" style="height: 240px" />
</div>
<div data-testid="clicked">{clicked}</div>
