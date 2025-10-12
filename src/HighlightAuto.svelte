<script>
  import LangTag from "./LangTag.svelte";
  import hljs from "highlight.js";

  let { 
    /** @type {any} */
    code,
    /** @type {boolean} */
    langtag = false,
    /** @type {(data: { highlighted: string; language: string }) => void} */
    onHighlight,
    children,
    ...restProps
  } = $props();

  /** @type {string} */
  let highlighted = $state("");

  /** @type {string} */
  let language = $state("");

  $effect(() => {
    const result = hljs.highlightAuto(code);
    highlighted = result.value;
    language = result.language || "";
    
    if (highlighted && onHighlight) {
      onHighlight({ highlighted, language });
    }
  });
</script>

{#if children}
  {@render children({ highlighted })}
{:else}
  <LangTag
    {...restProps}
    languageName={language}
    {langtag}
    {highlighted}
    {code}
  />
{/if}
