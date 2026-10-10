<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import {
    createDiffController,
    DiffMinimap,
    DiffView,
  } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { tsAfter, tsBefore } from "./samples.js";

  /** @type {import("svelte-highlight/diff-controller").Annotation[]} */
  let annotations = [
    {
      side: "new",
      line: 10,
      author: "Reviewer bot",
      tone: "suggestion",
      body: "Consider validating maxSize > 0 here.",
    },
    {
      side: "new",
      line: 19,
      author: "Alex",
      tone: "info",
      body: "Changing < to <= means an entry expires exactly at its deadline.\nIs that intended? It changes behavior for ttl = 0.",
    },
    {
      side: "new",
      line: 39,
      author: "Static analysis",
      tone: "warning",
      body: "keys().next() relies on Map insertion order; a refreshed key won't move to the end.",
    },
    {
      side: "old",
      line: 30,
      author: "CI",
      tone: "error",
      body: "Breaking change: delete() used to return void. 3 call sites ignore the result.",
    },
  ];

  const diff = createDiffController({ language: typescript, context: 2 });
  diff.update(tsBefore, tsAfter);
  $: diff.setOptions({ annotations });

  /** Adds a comment on the first line of a change. @param {number} change */
  function comment(change) {
    const block = diff.state().blocks.find((b) => b.id === change);
    if (!block) return;
    const onNew = block.bEnd > block.b;
    annotations = [
      ...annotations,
      {
        side: onNew ? "new" : "old",
        line: (onNew ? block.b : block.a) + 1,
        author: "You",
        tone: "info",
        body: `Comment #${annotations.length + 1} on change ${change + 1}`,
      },
    ];
  }

  const avatar = (/** @type {string | undefined} */ name) =>
    (name ?? "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2);
</script>

<p class="label-01 mb-3">
  Built from parts: a controller, <code class="code">DiffView</code> with custom
  <code class="code">note</code>
  and <code class="code">actions</code> slots, and
  <code class="code">DiffMinimap</code>. Click “+ Comment” on any change.
</p>

<div class="layout">
  <DiffView {diff} class={THEME_MODULE_NAME} style="height: 440px; flex: 1;">
    <div slot="note" let:note class="note note-{note.tone}">
      <span class="avatar">{avatar(note.author)}</span>
      <div>
        <strong>{note.author}</strong>
        <span class="body">{note.body}</span>
      </div>
    </div>
    <button
      slot="actions"
      let:change
      type="button"
      class="add"
      on:click={() => comment(change)}
    >
      + Comment
    </button>
  </DiffView>
  <DiffMinimap {diff} />
</div>

<style>
  .layout {
    display: flex;
  }

  .note {
    display: flex;
    gap: 10px;
    margin: 3px 2ch 3px 9ch;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid #393939;
    background: #262626;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    white-space: pre-wrap;
    overflow: hidden;
  }

  .note-warning {
    border-color: #8e6a00;
  }

  .note-error {
    border-color: #a2191f;
  }

  .note-suggestion {
    border-color: #198038;
  }

  .avatar {
    flex: none;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #4589ff;
    color: white;
    font-size: 10px;
    font-weight: 600;
  }

  .body {
    display: block;
    white-space: pre-wrap;
  }

  .add {
    font: inherit;
    font-size: 11px;
    padding: 0 8px;
    border-radius: 3px;
    border: 1px solid #525252;
    background: #262626;
    color: #c6c6c6;
    cursor: pointer;
  }
</style>
