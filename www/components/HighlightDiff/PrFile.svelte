<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { onMount } from "svelte";
  import {
    createDiffController,
    DiffView,
    loadLanguage,
  } from "svelte-highlight";

  /** @type {import("svelte-highlight/diff-edits").FilePatch} */
  export let file;

  /** @type {Record<string, import("svelte-highlight/languages").LanguageName>} */
  const byExtension = {
    ts: "typescript",
    js: "javascript",
    svelte: "svelte",
    astro: "astro",
    md: "markdown",
    json: "json",
    css: "css",
    yml: "yaml",
    sh: "bash",
  };

  const diff = createDiffController({ context: 3 });
  diff.setPatch(file);

  onMount(async () => {
    const name = byExtension[file.newPath.split(".").pop() ?? ""];
    if (name) diff.setOptions({ language: await loadLanguage(name) });
  });
</script>

<DiffView
  {diff}
  keyboard={false}
  class={THEME_MODULE_NAME}
  style="height: auto; max-height: 640px;"
/>
