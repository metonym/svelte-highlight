<script>
  import LangTag from "./LangTag.svelte";

  /** @type {any} */
  export let code;

  /** @type {boolean} */
  export let langtag = false;

  import hljs from "highlight.js/lib/core";
  import { afterUpdate, createEventDispatcher } from "svelte";
  import svelte from "./languages/svelte";

  const dispatch = createEventDispatcher();

  /** @type {string} */
  let highlighted = "";

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted });
  });

  $: {
    hljs.registerLanguage(svelte.name, svelte.register);
    highlighted = hljs.highlight(code, { language: svelte.name }).value;
  }
</script>

<slot {highlighted} {langtag} languageName="svelte">
  <LangTag
    {...$$restProps}
    languageName="svelte"
    {langtag}
    {highlighted}
    {code}
  />
</slot>
