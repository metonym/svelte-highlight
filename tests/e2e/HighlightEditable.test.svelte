<script>
  import { HighlightEditable } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  export let initialCode = "const a = 1;";

  let editor;
  let code = initialCode;
  let changes = 0;
  let historyState = { entries: [], index: 0, canUndo: false, canRedo: false };
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<HighlightEditable
  bind:this={editor}
  language={typescript}
  bind:code
  tabSize={2}
  label="Editable TypeScript example"
  --outline-color="rgb(255, 0, 0)"
  on:change={() => (changes += 1)}
  on:history={(e) => (historyState = e.detail)}
/>

<div data-testid="code" data-value={code}></div>
<div data-testid="changes" data-value={changes}></div>
<div data-testid="can-undo" data-value={historyState.canUndo}></div>
<div data-testid="can-redo" data-value={historyState.canRedo}></div>
<div data-testid="entries" data-value={historyState.entries.length}></div>

<button type="button" data-testid="undo" on:click={() => editor.undo()}>
  undo
</button>
<button type="button" data-testid="redo" on:click={() => editor.redo()}>
  redo
</button>
<button
  type="button"
  data-testid="select-all"
  on:click={() => editor.selectAll()}
>
  select all
</button>
<button type="button" data-testid="indent" on:click={() => editor.indent()}>
  indent
</button>
<button type="button" data-testid="outdent" on:click={() => editor.outdent()}>
  outdent
</button>
<button type="button" data-testid="insert" on:click={() => editor.insert("X")}>
  insert
</button>
<button
  type="button"
  data-testid="set-code"
  on:click={() => editor.setCode("xyz")}
>
  set code
</button>
<button type="button" data-testid="clear" on:click={() => editor.clear()}>
  clear
</button>
