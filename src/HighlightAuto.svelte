<script>
  // @ts-check
  import LangTag from "./LangTag.svelte";

  /** @type {any} */
  export let code;

  /** @type {boolean} */
  export let langtag = false;

  import hljs from "highlight.js";

  /** @type {string} */
  let highlighted = "";

  /** @type {string} */
  let language = "";

  $: ({ value: highlighted, language = "" } = hljs.highlightAuto(code));
</script>

<slot {highlighted}>
  <LangTag
    {...$$restProps}
    languageName={language}
    {langtag}
    {highlighted}
    {code}
  />
</slot>
