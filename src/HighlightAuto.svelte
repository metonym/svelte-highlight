<script>
  import hljs from "highlight.js";
  import { createEventDispatcher } from "svelte";
  import { createHighlighter } from "./highlighter.svelte.js";
  import LangTag from "./LangTag.svelte";

  /** @type {{ code: any; languageNames?: (import("./languages").LanguageName | (string & {}))[]; langtag?: boolean; [key: string]: any }} */
  let {
    code,
    languageNames = undefined,
    langtag = false,
    ...restProps
  } = $props();

  /**
   * @typedef {{ highlighted: string; language: string; }} HighlightEventDetail
   * @type {import("svelte").EventDispatcher<{ highlight: HighlightEventDetail}>}
   */
  const dispatch = createEventDispatcher();

  const core = createHighlighter(
    () => hljs.highlightAuto(code, languageNames),
    ({ value, language }) => {
      if (value)
        dispatch("highlight", { highlighted: value, language: language ?? "" });
    },
  );

  let highlighted = $derived(core.value.value);
  let language = $derived(core.value.language ?? "");
</script>

<slot {highlighted} {langtag} languageName={language}>
  <LangTag
    {...restProps}
    languageName={language}
    {langtag}
    {highlighted}
    {code}
  />
</slot>
