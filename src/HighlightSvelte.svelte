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

  import hljs from "highlight.js/lib/core.js";
  import xml from "highlight.js/lib/languages/xml.js";
  import hljsSvelte from "highlightjs-svelte/dist/index.js";
  import { createEventDispatcher, afterUpdate } from "svelte";

  const dispatch = createEventDispatcher();

  hljs.registerLanguage("xml", xml);
  hljsSvelte(hljs);

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted });
  });

  $: highlighted = hljs.highlight(code, { language: "svelte" }).value;
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
      {@html highlighted}
    </code>
  </pre>
</slot>
