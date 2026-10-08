<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import {
    createDiffController,
    DiffMinimap,
    DiffStats,
    DiffView,
    parsePatch,
  } from "svelte-highlight";
  import css from "svelte-highlight/languages/css";
  import javascript from "svelte-highlight/languages/javascript";
  import json from "svelte-highlight/languages/json";
  import markdown from "svelte-highlight/languages/markdown";
  import plaintext from "svelte-highlight/languages/plaintext";
  import python from "svelte-highlight/languages/python";
  import rust from "svelte-highlight/languages/rust";
  import typescript from "svelte-highlight/languages/typescript";
  import { commits, extToLanguage } from "./samples.js";

  /** @type {Record<string, any>} */
  const languages = {
    css,
    javascript,
    json,
    markdown,
    python,
    rust,
    typescript,
  };

  let commitIndex = 0;
  let fileIndex = 0;
  /** @type {"unified" | "split"} */
  let view = "unified";

  $: commit = /** @type {(typeof commits)[number]} */ (commits[commitIndex]);
  $: files = parsePatch(commit.patch);
  $: file = files[Math.min(fileIndex, files.length - 1)];
  $: totals = files.reduce(
    (t, f) => ({ add: t.add + f.additions, del: t.del + f.deletions }),
    { add: 0, del: 0 },
  );

  /** @param {string} path */
  function languageFor(path) {
    const ext = /** @type {keyof typeof extToLanguage} */ (
      path.split(".").pop() ?? ""
    );
    return languages[extToLanguage[ext]] ?? plaintext;
  }

  /** @param {number} i */
  function pickCommit(i) {
    commitIndex = i;
    fileIndex = 0;
  }

  // One controller drives the view, minimap, and stats.
  const diff = createDiffController();
  $: if (file) diff.setOptions({ language: languageFor(file.newPath), view });
  $: if (file) diff.setPatch(file);

  const statusLetter = {
    modified: "M",
    added: "A",
    deleted: "D",
    renamed: "R",
    binary: "B",
  };
</script>

<div class="viewer">
  <aside>
    <div class="heading">Commits <span>{commits.length}</span></div>
    {#each commits as c, i}
      <button
        type="button"
        class="commit"
        class:active={i === commitIndex}
        on:click={() => pickCommit(i)}
      >
        <span class="title">{c.title}</span>
        <span class="meta">{c.sha} · {c.author} · {c.date}</span>
      </button>
    {/each}
    <div class="heading">Changed files <span>{files.length}</span></div>
    {#each files as f, i}
      <button
        type="button"
        class="file"
        class:active={i === fileIndex}
        on:click={() => (fileIndex = i)}
      >
        <span class="name">{f.newPath.split("/").pop()}</span>
        <span class="status">{statusLetter[f.status]}</span>
        <span class="add">+{f.additions}</span>
        <span class="del">−{f.deletions}</span>
        <span class="path">{f.newPath.split("/").slice(0, -1).join("/")}</span>
      </button>
    {/each}
  </aside>
  <section>
    <header>
      <strong>{commit.title}</strong>
      <span class="meta">
        {files.length}
        files <span class="add">+{totals.add}</span>
        <span class="del">−{totals.del}</span>
        <button
          type="button"
          on:click={() => (view = view === "split" ? "unified" : "split")}
        >
          {view}
        </button>
      </span>
    </header>
    {#if file}
      <div class="filebar">
        <span
          >{file.oldPath !== file.newPath
            ? `${file.oldPath} → `
            : ""}{file.newPath}</span
        >
        <span>
          <DiffStats {diff} />
          <button type="button" on:click={() => diff.prevChange()}>↑</button>
          <button type="button" on:click={() => diff.nextChange()}>↓</button>
        </span>
      </div>
      <div class="body">
        <DiffView
          {diff}
          class={THEME_MODULE_NAME}
          style="height: 440px; flex: 1;"
        />
        <DiffMinimap {diff} />
      </div>
    {/if}
  </section>
</div>

<style>
  .viewer {
    display: grid;
    grid-template-columns: 300px 1fr;
    border: 1px solid #393939;
    font-size: 13px;
  }

  aside {
    border-right: 1px solid #393939;
    max-height: 520px;
    overflow: auto;
  }

  .heading {
    padding: 8px 12px;
    font-weight: 600;
    border-bottom: 1px solid #393939;
  }

  .heading span {
    color: #8d8d8d;
    font-weight: 400;
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
    padding: 6px 12px;
    cursor: pointer;
  }

  button.file {
    grid-template-columns: 1fr auto auto auto;
    gap: 0 10px;
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

  .meta,
  .path {
    color: #8d8d8d;
    font-size: 12px;
  }

  .path {
    grid-column: 1 / -1;
  }

  .add {
    color: #3fb950;
  }

  .del {
    color: #f85149;
  }

  header {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid #393939;
  }

  header button {
    margin-left: 8px;
    background: #393939;
    color: inherit;
    border: 0;
    padding: 0 8px;
    cursor: pointer;
  }

  .filebar {
    display: flex;
    justify-content: space-between;
    padding: 4px 12px;
    color: #8d8d8d;
    font-family: monospace;
  }

  .filebar button {
    background: none;
    border: 0;
    color: inherit;
    cursor: pointer;
  }

  .body {
    display: flex;
  }
</style>
