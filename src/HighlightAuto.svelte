<script context="module" lang="ts">
  import type { Props, Slots, Events, HighlightedCode } from "./shared";
</script>

<script lang="ts">
  import LangTag from "./LangTag.svelte";

  interface $$Props extends Omit<Props, "language"> {}

  interface $$Slots extends Slots {}

  interface $$Events
    extends Events<
      HighlightedCode & {
        /**
         * The inferred language name.
         * @example "css"
         */
        language?: string;
      }
    > {}

  export let code: $$Props["code"];

  export let langtag = false;

  import hljs from "highlight.js";
  import { createEventDispatcher, afterUpdate } from "svelte";

  const dispatch = createEventDispatcher();

  let highlighted = "";
  let language = undefined;

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted, language });
  });

  $: ({ value: highlighted, language } = hljs.highlightAuto(code));
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
