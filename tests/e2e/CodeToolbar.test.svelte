<script lang="ts">
  import Highlight, {
    CodeToolbar,
    CopyButton,
    LineNumbers,
    ToolbarButton,
    WrapToggle,
  } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = Array.from(
    { length: 200 },
    (_, i) => `const line${i} = ${i};`,
  ).join("\n");

  let wrap = false;
  let downloads = 0;
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<div style="height: 200px; overflow-y: auto;" data-testid="scroll-container">
  <Highlight
    language={typescript}
    {code}
    {wrap}
    let:highlighted
    let:languageName
  >
    <CodeToolbar {languageName} title="app.ts">
      <ToolbarButton label="Download" on:click={() => downloads++}>
        <span data-testid="downloads">{downloads}</span>
      </ToolbarButton>
      <ToolbarButton label="Docs" href="#docs">D</ToolbarButton>
      <WrapToggle bind:wrap />
      <CopyButton {code} />
    </CodeToolbar>
    <LineNumbers {highlighted} wrapLines={wrap} />
  </Highlight>
</div>
