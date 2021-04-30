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
  import xml from "highlight.js/lib/languages/xml";
  import javascript from "highlight.js/lib/languages/javascript";
  import css from "highlight.js/lib/languages/css";
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
    {...$$restProps}>
    <code>
      {@html highlighted}
    </code>
  </pre>
</slot>
