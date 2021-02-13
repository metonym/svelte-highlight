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

  import hljs from "highlight.js/lib/highlight";
  import { createEventDispatcher, afterUpdate } from "svelte";

  const dispatch = createEventDispatcher();

  let highlighted = undefined;

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted });
  });

  $: if (language.name && language.register) {
    hljs.registerLanguage(language.name, language.register);
    highlighted = hljs.highlight(language.name, code).value;
  }
</script>

<slot highlighted="{highlighted}">
  <pre
    class:hljs="{true}"
    {...$$restProps}
    on:click
    on:mouseover
    on:mouseenter
    on:mouseleave
    on:focus
    on:blur>
    <code>
      {#if highlighted !== undefined}
        {@html highlighted}
      {:else}{code}{/if}
    </code>
  </pre>
</slot>
