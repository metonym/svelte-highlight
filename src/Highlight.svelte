<script>
  // @ts-check

  /** @type {import("./languages").LanguageType<string>} */
  export let language;

  /** @type {any} */
  export let code;

  /** @type {boolean} */
  export let langtag = false;

  import hljs from "highlight.js/lib/core";
  import { createEventDispatcher, afterUpdate } from "svelte";
  import LangTag from "./LangTag.svelte";

  const dispatch = createEventDispatcher();

  /** @type {string} */
  let highlighted = "";

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted });
  });

  $: {
    hljs.registerLanguage(language.name, language.register);
    highlighted = hljs.highlight(code, { language: language.name }).value;
  }
</script>

<slot {highlighted}>
  <LangTag
    {...$$restProps}
    languageName={language.name}
    {langtag}
    {highlighted}
    {code}
  />
</slot>
