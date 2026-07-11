<script>
  /** @type {import("./languages").LanguageType<string>} */
  export let language;

  /** @type {any} */
  export let code;

  /** @type {boolean} */
  export let langtag = false;

  import { afterUpdate, createEventDispatcher } from "svelte";
  import LangTag from "./LangTag.svelte";
  import { ensureRegistered, registry } from "./registry.js";

  const dispatch = createEventDispatcher();

  /** @type {string} */
  let highlighted = "";

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted });
  });

  $: {
    ensureRegistered(language);
    const source = typeof code === "string" ? code : String(code ?? "");
    highlighted = registry.highlight(source, { language: language.name }).value;
  }
</script>

<slot {highlighted} {langtag} languageName={language.name}>
  <LangTag
    {...$$restProps}
    languageName={language.name}
    {langtag}
    {highlighted}
    {code}
  />
</slot>
