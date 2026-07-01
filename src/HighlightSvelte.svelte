<script>
  import { createEventDispatcher } from "svelte";
  import { highlightLanguage } from "./core.js";
  import { createHighlighter } from "./highlighter.svelte.js";
  import LangTag from "./LangTag.svelte";
  import svelte from "./languages/svelte";

  /** @type {{ code: any; langtag?: boolean; [key: string]: any }} */
  let { code, langtag = false, ...restProps } = $props();

  const dispatch = createEventDispatcher();

  const core = createHighlighter(
    () => highlightLanguage(svelte, code),
    (highlighted) => {
      if (highlighted) dispatch("highlight", { highlighted });
    },
  );
</script>

<slot highlighted={core.value} {langtag} languageName="svelte">
  <LangTag
    {...restProps}
    languageName="svelte"
    {langtag}
    highlighted={core.value}
    {code}
  />
</slot>
