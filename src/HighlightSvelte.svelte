<script>
  // @ts-check
  import LangTag from "./LangTag.svelte";

  /** @type {any} */
  export let code;

  /** @type {boolean} */
  export let langtag = false;

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

<slot {highlighted}>
  <LangTag
    {...$$restProps}
    languageName="svelte"
    {langtag}
    {highlighted}
    {code}
  />
</slot>
