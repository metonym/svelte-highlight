<script>
  // No static import of highlight-cascade here, so the editor's dynamic
  // import is the only way it loads.
  import { HighlightEditable } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";
  import atomOneDark from "svelte-highlight/themes/atom-one-dark";

  let code = "const a = 1;";
  let theme = github;
  /** @type {"dom" | "css-highlights"} */
  let engine = "css-highlights";
  let shown = true;

  let editor;
  /** @type {string | undefined} */
  let resolvedEngine;
</script>

{#if shown}
  <HighlightEditable
    bind:this={editor}
    language={typescript}
    bind:code
    {engine}
    {theme}
  />
{/if}

<div data-testid="resolved-engine" data-value={resolvedEngine}></div>

<button
  type="button"
  on:click={() => (resolvedEngine = editor?.resolvedEngine())}
>
  read engine
</button>

<button type="button" on:click={() => (code = "let b = 'two';")}>
  set code
</button>
<button type="button" on:click={() => (theme = atomOneDark)}>set theme</button>
<button
  type="button"
  on:click={() => (engine = engine === "dom" ? "css-highlights" : "dom")}
>
  toggle engine
</button>
<button type="button" on:click={() => (shown = false)}>unmount</button>
