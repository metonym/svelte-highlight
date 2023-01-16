<script context="module" lang="ts">
  import type { Props, Slots, Events } from "./shared";
</script>

<script lang="ts">
  interface $$Props extends Props {}

  interface $$Slots extends Slots {}

  interface $$Events extends Events {}

  export let language: $$Props["language"];

  export let code: $$Props["code"];

  export let langtag = false;

  import hljs from "highlight.js/lib/core";
  import { createEventDispatcher, afterUpdate } from "svelte";
  import LangTag from "./LangTag.svelte";

  const dispatch = createEventDispatcher();

  let highlighted = "";

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted });
  });

  $: if (language.name && language.register) {
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
