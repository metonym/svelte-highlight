<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { onMount, tick } from "svelte";
  import {
    createDiffController,
    DiffMinimap,
    DiffStats,
    DiffView,
    loadLanguage,
  } from "svelte-highlight";
  import plaintext from "svelte-highlight/languages/plaintext";

  /** @typedef {import("@www/diff-data").CommitSummary} CommitSummary */
  /** @typedef {import("@www/diff-data").CommitFile} CommitFile */

  /** @type {Record<string, import("svelte-highlight/languages").LanguageName>} */
  const byExtension = {
    ts: "typescript",
    js: "javascript",
    mjs: "javascript",
    svelte: "svelte",
    astro: "astro",
    md: "markdown",
    json: "json",
    lock: "json",
    css: "css",
    yml: "yaml",
    yaml: "yaml",
    sh: "bash",
    html: "html",
    toml: "toml",
  };

  /** @type {CommitSummary[]} */
  let commits = [];
  /** @type {CommitFile[]} */
  let files = [];
  let commitIndex = 0;
  let fileIndex = 0;
  let filter = "";
  let loading = false;
  let loaded = false;
  /** @type {"unified" | "split"} */
  let view = "unified";
  let wrap = false;
  let diffMs = 0;

  const diff = createDiffController({ language: plaintext });

  $: shown = commits.filter((c) =>
    `${c.title} ${c.sha} ${c.author} ${c.label ?? ""}`
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );
  $: file = files[fileIndex];
  $: rowCount = $diff.rows().length;
  $: lineCount = Math.max(
    $diff.state().beforeLines.length,
    $diff.state().afterLines.length,
  );
  $: diff.setOptions({ view });

  /** @param {number} i */
  async function pickCommit(i) {
    commitIndex = i;
    fileIndex = 0;
    loading = true;
    const sha = shown[i]?.sha;
    files = sha ? await (await fetch(`/diff-data/${sha}.json`)).json() : [];
    loading = false;
    showFile(0);
  }

  /** @param {number} i */
  async function showFile(i) {
    fileIndex = i;
    const f = files[i];
    if (!f || f.skipped) {
      diff.update("", "");
      return;
    }
    const name = byExtension[f.path.split(".").pop() ?? ""];
    const language = name
      ? await loadLanguage(name).catch(() => plaintext)
      : plaintext;
    if (files[fileIndex] !== f) return;
    diff.setOptions({ language });
    const t0 = performance.now();
    diff.update(f.before, f.after);
    diffMs = performance.now() - t0;
  }

  const statusLetter = {
    modified: "M",
    added: "A",
    deleted: "D",
    renamed: "R",
  };

  onMount(async () => {
    commits = await (await fetch("/diff-data/commits.json")).json();
    loaded = true;
    await tick();
    pickCommit(0);
  });
</script>

<p class="label-01 mb-3">
  This repo's own history, read with git at build time: full before and after
  files, not patch fragments. The first three commits are picked for being hard:
  a lockfile, a rewrite with renames, and a 134-file refactor.
</p>

{#if loaded && commits.length === 0}
  <p class="label-01">This build has no git history to show.</p>
{:else}
  <div class="viewer">
    <aside>
      <input class="filter" placeholder="Filter commits" bind:value={filter}>
      <div class="commits">
        {#each shown as c, i (c.sha)}
          <button
            type="button"
            class="commit"
            class:active={i === commitIndex}
            on:click={() => pickCommit(i)}
          >
            {#if c.label}
              <span class="badge">{c.label}</span>
            {/if}
            <span class="title">{c.title}</span>
            <span class="meta">
              {c.sha.slice(0, 8)}
              · {c.files} files · <span class="add">+{c.additions}</span>
              <span class="del">−{c.deletions}</span>
            </span>
          </button>
        {/each}
      </div>
      <div class="heading">Files <span>{files.length}</span></div>
      <div class="files">
        {#each files as f, i (f.path)}
          <button
            type="button"
            class="file"
            class:active={i === fileIndex}
            on:click={() => showFile(i)}
          >
            <span class="status">{statusLetter[f.status]}</span>
            <span class="name" title={f.path}>{f.path}</span>
            {#if f.skipped}
              <span class="skipped">{f.skipped}</span>
            {/if}
          </button>
        {/each}
      </div>
    </aside>
    <section>
      <header>
        <span class="path">
          {#if loading}
            Loading…
          {:else if file}
            {file.status === "renamed"
              ? `${file.oldPath} → ${file.path}`
              : file.path}
          {/if}
        </span>
        <span class="tools">
          <DiffStats {diff} />
          <span class="meta">
            {lineCount.toLocaleString()}
            lines · {rowCount.toLocaleString()} rows ·
            {rowCount > 500 ? "virtualized" : "all rows rendered"}
            · diffed in {diffMs.toFixed(1)} ms
          </span>
          <button
            type="button"
            on:click={() => (view = view === "split" ? "unified" : "split")}
          >
            {view}
          </button>
          <button type="button" on:click={() => (wrap = !wrap)}>
            wrap: {wrap ? "on" : "off"}
          </button>
          <button type="button" on:click={() => diff.expandAll()}>
            expand all
          </button>
          <button type="button" on:click={() => diff.prevChange()}>↑</button>
          <button type="button" on:click={() => diff.nextChange()}>↓</button>
        </span>
      </header>
      {#if file?.skipped}
        <p class="empty">Skipped: {file.skipped}.</p>
      {:else}
        <div class="body">
          <DiffView
            {diff}
            {wrap}
            class={THEME_MODULE_NAME}
            style="height: 520px; flex: 1;"
          />
          <DiffMinimap {diff} style="height: 520px" />
        </div>
      {/if}
    </section>
  </div>
{/if}

<style>
  .viewer {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    border: 1px solid #393939;
    font-size: 13px;
  }

  aside {
    display: flex;
    flex-direction: column;
    border-right: 1px solid #393939;
    max-height: 560px;
    min-height: 0;
  }

  .filter {
    margin: 8px;
    padding: 4px 8px;
    background: #262626;
    border: 1px solid #525252;
    color: inherit;
    font: inherit;
  }

  .commits {
    flex: 1;
    overflow: auto;
    min-height: 120px;
  }

  .files {
    flex: 1;
    overflow: auto;
    min-height: 120px;
  }

  .heading {
    padding: 6px 12px;
    font-weight: 600;
    border-top: 1px solid #393939;
  }

  .heading span,
  .meta,
  .skipped {
    color: #8d8d8d;
    font-weight: 400;
    font-size: 12px;
  }

  button.commit,
  button.file {
    display: grid;
    width: 100%;
    text-align: left;
    background: none;
    border: 0;
    color: inherit;
    font: inherit;
    padding: 5px 12px;
    cursor: pointer;
  }

  button.file {
    grid-template-columns: 1.5em minmax(0, 1fr) auto;
    gap: 6px;
  }

  button.active {
    background: #353535;
  }

  .title,
  .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .badge {
    justify-self: start;
    font-size: 11px;
    padding: 0 6px;
    margin-bottom: 2px;
    border-radius: 3px;
    background: #6929c4;
  }

  .add {
    color: #3fb950;
  }

  .del {
    color: #f85149;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 12px;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    border-bottom: 1px solid #393939;
  }

  .path {
    font-family: monospace;
  }

  .tools {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .tools button {
    background: #393939;
    color: inherit;
    border: 0;
    padding: 2px 8px;
    cursor: pointer;
  }

  .body {
    display: flex;
  }

  .empty {
    padding: 2rem;
    color: #8d8d8d;
  }
</style>
