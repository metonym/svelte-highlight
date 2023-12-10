<script>
  // @ts-check
  import LangTag from "./LangTag.svelte";

  /** @type {any} */
  export let code;

  /** @type {boolean} */
  export let langtag = false;

  import hljs from "highlight.js";
  import { createEventDispatcher, afterUpdate } from "svelte";

  /**
   * @typedef {{ highlighted: string; language: string; }} HighlightEventDetail
   * @type {import("svelte").EventDispatcher<{ highlight: HighlightEventDetail}>}
   */
  const dispatch = createEventDispatcher();

  /** @type {string} */
  let highlighted = "";

  /** @type {string} */
  let language = "";

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted, language });
  });

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
