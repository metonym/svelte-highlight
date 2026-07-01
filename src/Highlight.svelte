<script>
  import { createEventDispatcher } from "svelte";
  import { highlightLanguage } from "./core.js";
  import { createHighlighter } from "./highlighter.svelte.js";
  import LangTag from "./LangTag.svelte";

  /** @type {{ language: import("./languages").LanguageType<string>; code: any; langtag?: boolean; [key: string]: any }} */
  let { language, code, langtag = false, ...restProps } = $props();

  const dispatch = createEventDispatcher();

  const core = createHighlighter(
    () => highlightLanguage(language, code),
    (highlighted) => {
      if (highlighted) dispatch("highlight", { highlighted });
    },
  );
</script>

<slot highlighted={core.value} {langtag} languageName={language.name}>
  <LangTag
    {...restProps}
    languageName={language.name}
    {langtag}
    highlighted={core.value}
    {code}
  />
</slot>
