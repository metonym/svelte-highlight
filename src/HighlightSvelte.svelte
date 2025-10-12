<script>
  import LangTag from "./LangTag.svelte";
  import hljs from "highlight.js/lib/core";
  import xml from "highlight.js/lib/languages/xml";
  import javascript from "highlight.js/lib/languages/javascript";
  import css from "highlight.js/lib/languages/css";

  let { 
    /** @type {any} */
    code,
    /** @type {boolean} */
    langtag = false,
    /** @type {(data: { highlighted: string }) => void} */
    onHighlight,
    children,
    ...restProps
  } = $props();

  /** @type {string} */
  let highlighted = $state("");

  // Register languages once
  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("css", css);

  $effect(() => {
    highlighted = hljs.highlightAuto(code).value;
    
    if (highlighted && onHighlight) {
      onHighlight({ highlighted });
    }
  });
</script>

{#if children}
  {@render children({ highlighted })}
{:else}
  <LangTag
    {...restProps}
    languageName="svelte"
    {langtag}
    {highlighted}
    {code}
  />
{/if}
