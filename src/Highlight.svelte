<script>
  import hljs from "highlight.js/lib/core";
  import LangTag from "./LangTag.svelte";

  let { 
    /** @type {import("./languages").LanguageType<string>} */
    language,
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

  $effect(() => {
    hljs.registerLanguage(language.name, language.register);
    highlighted = hljs.highlight(code, { language: language.name }).value;
    
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
    languageName={language.name}
    {langtag}
    {highlighted}
    {code}
  />
{/if}
