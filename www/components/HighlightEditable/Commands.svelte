<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import { HighlightEditable } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  let editor;
  let code = "const add = (a, b) => a + b;";
  let historyState = { canUndo: false, canRedo: false };
</script>

<HighlightEditable
  bind:this={editor}
  language={typescript}
  bind:code
  class={THEME_MODULE_NAME}
  on:history={(e) => (historyState = e.detail)}
/>

<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem">
  <Button
    size="small"
    kind="tertiary"
    disabled={!historyState.canUndo}
    on:click={() => editor.undo()}
    >Undo</Button
  >
  <Button
    size="small"
    kind="tertiary"
    disabled={!historyState.canRedo}
    on:click={() => editor.redo()}
    >Redo</Button
  >
  <Button size="small" kind="ghost" on:click={() => editor.indent()}>
    Indent
  </Button>
  <Button size="small" kind="ghost" on:click={() => editor.outdent()}>
    Outdent
  </Button>
  <Button size="small" kind="ghost" on:click={() => editor.insert("// TODO\n")}>
    Insert
  </Button>
  <Button size="small" kind="danger-tertiary" on:click={() => editor.clear()}>
    Clear
  </Button>
</div>
