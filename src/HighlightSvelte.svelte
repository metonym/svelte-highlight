<script>
  export let code = "";
  export let highlighted = "";
  export let typescript = false;

  import hljs from "highlight.js/lib/core";
  import xml from "highlight.js/lib/languages/xml";
  import langJavascript from "highlight.js/lib/languages/javascript";
  import langTypescript from "highlight.js/lib/languages/typescript";
  import css from "highlight.js/lib/languages/css";
  import hljsSvelte from "highlightjs-svelte";
  import { createEventDispatcher, tick } from "svelte";

  const dispatch = createEventDispatcher();

  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("javascript", typescript ? langTypescript : langJavascript);
  hljs.registerLanguage("css", css);
  hljsSvelte(hljs);

  $: {
    highlighted = hljs.highlight("svelte", code).value;
    tick().then(() => dispatch("highlight", highlighted));
  }
</script>

<slot highlighted="{highlighted}">
  <pre {...$$restProps} class:hljs="{true}">
    <code>
      {@html highlighted}
    </code>
  </pre>
</slot>
