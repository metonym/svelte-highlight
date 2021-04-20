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
  import javascript from "highlight.js/lib/languages/javascript.js";
  import css from "highlight.js/lib/languages/css.js";
  import { createEventDispatcher, afterUpdate } from "svelte";

  const dispatch = createEventDispatcher();

  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("css", css);

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted });
  });

  $: highlighted = hljs.highlightAuto(code).value;
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
