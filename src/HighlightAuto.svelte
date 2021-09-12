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
    data-language="{(language && language) || 'plaintext'}"
    {...$$restProps}>
      <code>
        {#if highlighted !== undefined}
        {@html highlighted}
      {:else}{code}{/if}
      </code>
    </pre>
</slot>
