<script>
  // Mounts createEditor on a plain element: Svelte only hosts the page.
  import { onMount } from "svelte";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  import { createEditor } from "../../src/editable.js";

  let element;
  let changes = 0;
  let editor;

  onMount(() => {
    editor = createEditor(element, {
      language: typescript,
      code: "const a = 1;",
      onChange: () => changes++,
    });
    return () => editor.destroy();
  });
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<pre><code
    bind:this={element}
    class="hljs"
    contenteditable="true"
    spellcheck="false"></code></pre>

<output data-testid="changes">{changes}</output>
<button type="button" data-testid="destroy" on:click={() => editor.destroy()}>
  destroy
</button>
