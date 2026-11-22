<script>
  import { onMount } from "svelte";
  import { createEditor, prerenderEditor } from "svelte-highlight/editable";
  import typescript from "svelte-highlight/languages/typescript";

  /** The code the element's markup was rendered for. */
  export let renderedCode = "const a = 1;\nlet b = 'two';";
  /** The code the editor starts with. */
  export let code = renderedCode;
  /** Wraps the markup in the comments Svelte's `{@html}` hydration leaves. */
  export let withComments = true;

  const prerendered = prerenderEditor(typescript, renderedCode);

  let element;
  let kept = "";
  let comments = "";

  onMount(() => {
    if (withComments) {
      element.prepend(document.createComment("hash"));
      element.append(document.createComment(""));
    }
    const before = Array.from(element.children);
    const editor = createEditor(element, {
      language: typescript,
      code,
      prerendered,
    });
    const after = Array.from(element.children);
    kept = String(
      before.length > 0 &&
        before.length === after.length &&
        before.every((span, i) => span === after[i]),
    );
    comments = String(
      Array.from(element.childNodes).filter((node) => node.nodeType === 8)
        .length,
    );
    return () => editor.destroy();
  });
</script>

<pre><code bind:this={element} contenteditable="true"
    >{@html prerendered.html}</code
  ></pre>
<div data-testid="kept" data-value={kept}></div>
<div data-testid="comments" data-value={comments}></div>
