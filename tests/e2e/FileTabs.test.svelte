<script lang="ts">
  import Highlight, { FileTabs } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const sources: Record<string, { language: typeof typescript; code: string }> =
    {
      "App.svelte": { language: typescript, code: "const answer = 42;" },
      "index.js": { language: javascript, code: "export default answer;" },
      "vite.config.js": { language: javascript, code: "export default {};" },
    };

  export let initialActive: string | undefined = undefined;

  let files = Object.keys(sources);

  let active = initialActive ?? files[0];
  let lastChange = "";
  let changeCount = 0;

  function removeActiveFile() {
    files = files.filter((file) => file !== active);
  }

  function clearFiles() {
    files = [];
  }
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<FileTabs
  {files}
  bind:active
  on:change={(event) => {
    lastChange = event.detail.active;
    changeCount += 1;
  }}
  let:active
>
  {#if active}
    <Highlight
      language={sources[active].language}
      code={sources[active].code}
    />
  {/if}
</FileTabs>

<p data-testid="active">{active}</p>
<p data-testid="last-change">{lastChange}</p>
<p data-testid="change-count">{changeCount}</p>
<button type="button" data-testid="remove-active" on:click={removeActiveFile}>
  Remove active file
</button>
<button type="button" data-testid="clear-files" on:click={clearFiles}>
  Clear files
</button>
