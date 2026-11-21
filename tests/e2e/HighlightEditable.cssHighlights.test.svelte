<script>
  import { HighlightEditable } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";

  export let initialCode = "const a = 1;";

  let editor;
  let code = initialCode;
  /** @type {string | undefined} */
  let resolvedEngine;
</script>

<HighlightEditable
  bind:this={editor}
  language={typescript}
  bind:code
  engine="css-highlights"
  theme={github}
/>

<div data-testid="code" data-value={code}></div>
<div data-testid="resolved-engine" data-value={resolvedEngine}></div>

<button
  type="button"
  on:click={() => (resolvedEngine = editor?.resolvedEngine())}
>
  read engine
</button>
