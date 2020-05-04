<script>
  export let code = undefined;

  import hljs from "highlight.js";
  import xml from "highlight.js/lib/languages/xml";
  import hljsSvelte from "highlightjs-svelte/dist/index.js";
  import { createEventDispatcher, afterUpdate } from "svelte";

  const dispatch = createEventDispatcher();

  hljs.registerLanguage("xml", xml);
  hljsSvelte(hljs);

  afterUpdate(() => {
    if (highlighted) {
      dispatch("highlight");
    }
  });

  $: highlighted = hljs.highlight("svelte", code).value;
</script>

<slot {highlighted}>
  <pre
    {...$$restProps}
    on:click
    on:mouseover
    on:mouseenter
    on:mouseleave
    on:focus
    on:blur
    class:hljs={true}>
    <code>
      {@html highlighted}
    </code>
  </pre>
</slot>
