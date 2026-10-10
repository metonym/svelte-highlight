<script>
  import { DiffFileList } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";

  export let count = 300;
  /** @type {"windowed" | "lazy" | "none"} */
  export let windowing = "windowed";
  export let customHeader = false;

  // Each file is 60 lines with two edits, so its folded diff is much
  // shorter than the size-based estimate: unmeasured files change height
  // when they mount.
  const files = Array.from({ length: count }, (_, f) => {
    const lines = Array.from(
      { length: 60 },
      (_, i) => `const f${f}_${i} = ${i};`,
    );
    const before = `${lines.join("\n")}\n`;
    const after = before
      .replace(`const f${f}_10 = 10;`, `const f${f}_10 = 1000;`)
      .replace(`const f${f}_50 = 50;`, `const f${f}_50 = 5000;`);
    return { path: `src/file-${f}.js`, before, after, language: javascript };
  });

  /** @type {DiffFileList} */
  let list;
  let jump = 0;
</script>

<input data-testid="jump-index" type="number" bind:value={jump}>
<button
  type="button"
  data-testid="jump"
  on:click={() => list.scrollToFile(jump)}
>
  jump
</button>

{#if customHeader}
  <DiffFileList bind:this={list} {files} {windowing} data-testid="list">
    <div
      slot="header"
      let:file
      let:stats
      let:toggle
      let:collapsed
      class="custom-header"
    >
      <button type="button" data-testid="custom-toggle" on:click={toggle}>
        {collapsed ? "show" : "hide"}
      </button>
      <span data-testid="custom-path">{file.path}</span>
      <span data-testid="custom-stats"
        >{stats ? `+${stats.additions}` : "?"}</span
      >
    </div>
  </DiffFileList>
{:else}
  <DiffFileList bind:this={list} {files} {windowing} data-testid="list" />
{/if}
