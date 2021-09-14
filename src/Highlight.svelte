<script>
  /**
   * @slot {{ highlighted?: string; }}
   * @event {{ highlighted: string; }} highlight
   */

  /** @type {{ name?: string; register: (hljs: any) => Record<string, any>; }} */
  export let language = { name: undefined, register: undefined };

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

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted });
  });

  $: if (language.name && language.register) {
    hljs.registerLanguage(language.name, language.register);
    highlighted = hljs.highlight(code, { language: language.name }).value;
  }
</script>

<slot highlighted="{highlighted}">
  <pre
    class:langtag
    data-language="{(language.name && language.name) || 'plaintext'}"
    {...$$restProps}>
    <code class="hljs">
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
    padding: 1em;
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
