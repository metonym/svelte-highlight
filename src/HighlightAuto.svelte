<script>
  import hljs from "highlight.js";
  import { afterUpdate, createEventDispatcher } from "svelte";
  import LangTag from "./LangTag.svelte";

  /** @type {any} */
  export let code;

  /** @type {(import("./languages").LanguageName | (string & {}))[] | undefined} */
  export let languageNames = undefined;

  /** @type {import("./languages").LanguageType<string>[] | undefined} */
  export let languages = undefined;

  /** @type {boolean} */
  export let langtag = false;

  /**
   * @typedef {{ language?: string; relevance: number }} SecondBest
   * @typedef {{ highlighted: string; language: string; secondBest?: { language: string; relevance: number } }} HighlightEventDetail
   * @type {import("svelte").EventDispatcher<{ highlight: HighlightEventDetail}>}
   */
  const dispatch = createEventDispatcher();

  /** @type {string} */
  let highlighted = "";

  /** @type {string} */
  let language = "";

  /** @type {SecondBest | undefined} */
  let secondBest = undefined;

  afterUpdate(() => {
    if (highlighted)
      dispatch("highlight", {
        highlighted,
        language,
        ...(secondBest
          ? {
              secondBest: {
                language: secondBest.language ?? "",
                relevance: secondBest.relevance,
              },
            }
          : {}),
      });
  });

  $: {
    if (languages) {
      for (const language of languages) {
        hljs.registerLanguage(language.name, language.register);
      }
    }

    const subset = languageNames
      ? [
          ...languageNames,
          ...(languages?.map((language) => language.name) ?? []),
        ]
      : undefined;

    ({
      value: highlighted,
      language = "",
      secondBest = undefined,
    } = hljs.highlightAuto(code, subset));
  }
</script>

<slot {highlighted} {langtag} languageName={language}>
  <LangTag
    {...$$restProps}
    languageName={language}
    {langtag}
    {highlighted}
    {code}
  />
</slot>
