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
  export let manyFiles = false;
  export let width: string | undefined = undefined;

  const manyFileNames = Array.from(
    { length: 20 },
    (_, i) => `some-very-long-file-name-number-${i}.ts`,
  );

  let files = manyFiles ? manyFileNames : Object.keys(sources);

  let active = initialActive ?? files[0];
  let lastChange = "";
  let changeCount = 0;

  // Re-applies `initialActive` when the test updates it post-mount, to
  // simulate a `bind:active` value set programmatically from outside.
  $: if (initialActive !== undefined) active = initialActive;

  function removeActiveFile() {
    files = files.filter((file) => file !== active);
  }

  function clearFiles() {
    files = [];
  }
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<div style={width ? `width: ${width}` : undefined}>
  <FileTabs
    {files}
    bind:active
    on:change={(event) => {
      lastChange = event.detail.active;
      changeCount += 1;
    }}
    let:active
  >
    {#if active && sources[active]}
      <Highlight
        language={sources[active].language}
        code={sources[active].code}
      />
    {/if}
  </FileTabs>
</div>

<p data-testid="active">{active}</p>
<p data-testid="last-change">{lastChange}</p>
<p data-testid="change-count">{changeCount}</p>
<button type="button" data-testid="remove-active" on:click={removeActiveFile}>
  Remove active file
</button>
<button type="button" data-testid="clear-files" on:click={clearFiles}>
  Clear files
</button>
