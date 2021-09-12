<script>
  /**
   * @slot {{ highlighted?: string; }}
   * @event {{ highlighted: string; }} highlight
   */

  /**
   * Source code to highlight
   * @type {string}
   */
  export let code = undefined;

  /**
   * Add a language tag to the top-right
   * of the code block
   * @type {boolean}
   */
  export let langtag = false;

  import hljs from "highlight.js/lib/core";
  import { createEventDispatcher, afterUpdate } from "svelte";

  const dispatch = createEventDispatcher();

  let highlighted = undefined;
  let language = undefined;

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted });
  });

  $: if (code) {
    ({ value: highlighted, language } = hljs.highlightAuto(code));
  }
</script>

<slot highlighted="{highlighted}">
  <pre
    class:hljs="{true}"
    class:langtag
    data-language="{(language && language) || 'plaintext'}"
    {...$$restProps}>
      <code>
        {#if highlighted !== undefined}
        {@html highlighted}
      {:else}{code}{/if}
      </code>
    </pre>
</slot>

<style>
  pre.langtag {
    position: relative;
  }
  pre.langtag::after {
    content: attr(data-language);
    position: absolute;
    top: 0;
    right: 0;
    padding: calc(1em + 3px) calc(1em + 5px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: inherit;
    color: inherit;
    background: var(--hljs-background);
    color: var(--hljs-foreground);
    border-radius: var(--hljs-radius);
  }
</style>
