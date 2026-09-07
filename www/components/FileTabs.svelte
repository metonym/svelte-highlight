<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import Highlight, { FileTabs, HighlightSvelte } from "svelte-highlight";
  import css from "svelte-highlight/languages/css";
  import javascript from "svelte-highlight/languages/javascript";
  import typescript from "svelte-highlight/languages/typescript";

  const sources = {
    "App.svelte": { language: typescript, code: "const answer = 42;" },
    "index.js": { language: javascript, code: "export default answer;" },
    "styles.css": { language: css, code: ".hljs {\n  color: inherit;\n}" },
  };

  let files = Object.keys(sources);
  let active = files[0];

  function removeActiveFile() {
    files = files.filter((file) => file !== active);
  }

  const manyFiles = Array.from(
    { length: 12 },
    (_, i) => `component-${i}.svelte`,
  );
  let manyFilesActive = manyFiles[0];

  const snippet = `<script>
  import Highlight, { FileTabs } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";

  const sources = {
    "App.svelte": { language: typescript, code: "const answer = 42;" },
    "index.js": { language: javascript, code: "export default answer;" },
  };

  const files = Object.keys(sources);
<\/script>

<svelte:head>
  {@html github}
</svelte:head>

<FileTabs {files} let:active>
  <Highlight language={sources[active].language} code={sources[active].code} />
</FileTabs>`;
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<p class="mb-5">Pick a tab, or use the arrow keys:</p>

<FileTabs {files} bind:active let:active>
  {#if active}
    <Highlight
      language={sources[active].language}
      code={sources[active].code}
      class={THEME_MODULE_NAME}
    />
  {/if}
</FileTabs>

<p class="label-01 mb-3" style="margin-top: 1.5rem">
  Removing the active file selects its neighbor instead of leaving no tab
  selected:
</p>

<Button
  size="small"
  kind="tertiary"
  disabled={files.length === 0}
  on:click={removeActiveFile}
>
  Remove "{active}"
</Button>

<p class="label-01 mb-3" style="margin-top: 1.5rem">
  A tab strip narrower than its tabs fades the overflowing edge, and jumping to
  a tab scrolls it into view:
</p>

<div style="max-width: 320px" class="mb-3">
  <FileTabs files={manyFiles} bind:active={manyFilesActive}>
    <p class="label-01" style="padding: 1em">{manyFilesActive}</p>
  </FileTabs>
</div>

<Button
  size="small"
  kind="tertiary"
  on:click={() => (manyFilesActive = manyFiles[manyFiles.length - 1])}
>
  Jump to last tab
</Button>
