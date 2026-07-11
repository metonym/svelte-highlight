<script>
  import LangTag from "./LangTag.svelte";

  /** @type {any} */
  export let code;

  /** @type {boolean} */
  export let langtag = false;

  import { afterUpdate, createEventDispatcher } from "svelte";
  import svelte from "./languages/svelte";
  import { ensureRegistered, registry } from "./registry.js";

  const dispatch = createEventDispatcher();

  /** @type {string} */
  let highlighted = "";

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted });
  });

  $: {
    ensureRegistered(svelte);
    const source = typeof code === "string" ? code : String(code ?? "");
    highlighted = registry.highlight(source, { language: svelte.name }).value;
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
