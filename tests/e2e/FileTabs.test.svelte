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

  const files = Object.keys(sources);

  let active = files[0];
  let lastChange = "";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<FileTabs
  {files}
  bind:active
  on:change={(event) => (lastChange = event.detail.active)}
  let:active
>
  <Highlight language={sources[active].language} code={sources[active].code} />
</FileTabs>

<p data-testid="active">{active}</p>
<p data-testid="last-change">{lastChange}</p>
