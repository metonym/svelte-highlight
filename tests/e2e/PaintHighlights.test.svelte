<script>
  import { onMount } from "svelte";
  import { paintHighlights } from "svelte-highlight/dom.js";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/themes/github";

  /** @type {HTMLElement} */
  let code;
  /** @type {ReturnType<typeof paintHighlights> | undefined} */
  let handle;
  let engine = "";

  onMount(() => {
    handle = paintHighlights(code, { language: typescript, theme: github });
    engine = handle.engine;
    return () => handle?.destroy();
  });
</script>

<pre><code bind:this={code}>const add = (a, b) => a + b;</code></pre>
<p data-testid="engine">{engine}</p>
<button
  type="button"
  on:click={() => handle?.update({ code: "let total = 1;" })}>update</button
>
<button type="button" on:click={() => handle?.destroy()}>destroy</button>
