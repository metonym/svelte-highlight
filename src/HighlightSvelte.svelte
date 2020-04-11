<script>
  export let code = undefined;

  import hljs from "highlight.js";
  import xml from "highlight.js/lib/languages/xml";
  import hljsSvelte from "highlightjs-svelte/dist/index.js";

  hljs.registerLanguage("xml", xml);
  hljsSvelte(hljs);

  $: highlighted = hljs.highlight("svelte", code).value;
</script>

<slot {highlighted}>
  <pre {...$$restProps} class:hljs={true}>
    <code>
      {@html highlighted}
    </code>
  </pre>
</slot>
