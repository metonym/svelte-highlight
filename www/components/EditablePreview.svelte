<script>
  import { Button, Column, Row, Slider } from "carbon-components-svelte";
  import {
    Highlight,
    HighlightEditable,
    HighlightStyle,
    LineNumbers,
  } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  import githubDark from "svelte-highlight/styles/github-dark";
  import nord from "svelte-highlight/styles/nord";

  let code = `interface User {
  id: number;
  name: string;
}

const greet = (user: User): string => {
  return \`Hello, \${user.name}!\`;
};`;

  let lastEvent = "none";
  let outlineColor = "#42be65";
  let outlineWidth = 2;

  /** @type {"dom" | "css-highlights"} */
  let engine = "dom";

  /** @type {import("svelte-highlight").HighlightEditable} */
  let editor;

  /** @type {{ entries: { size: number }[]; index: number; canUndo: boolean; canRedo: boolean }} */
  let historyState = { entries: [], index: 0, canUndo: false, canRedo: false };

  $: resolvedEngine = editor?.resolvedEngine();

  const sideThemes = [
    { name: "atom-one-dark", theme: atomOneDark },
    { name: "nord", theme: nord },
  ];

  const cssHighlightThemes = [
    { name: "github-dark", theme: githubDark },
    { name: "nord", theme: nord },
  ];

  // External `code` mutation to demo repaint.
  function sortLines() {
    code = code.split("\n").sort().join("\n");
  }
</script>

<Row class="mb-9">
  <Column xlg={10} lg={10} md={12} class="mb-5">
    <div class="label-01 mb-3">
      Enter inserts newlines. Tab and Shift+Tab indent selected lines.
      Cmd/Ctrl+Z undoes, Shift+Z or Ctrl+Y redoes. The caret and selection
      survive re-highlight.
    </div>

    <div class="toolbar">
      <Button
        size="small"
        kind="tertiary"
        disabled={!historyState.canUndo}
        on:click={() => editor.undo()}
        >Undo</Button
      >
      <Button
        size="small"
        kind="tertiary"
        disabled={!historyState.canRedo}
        on:click={() => editor.redo()}
        >Redo</Button
      >
      <Button size="small" kind="ghost" on:click={() => editor.indent()}>
        Indent
      </Button>
      <Button size="small" kind="ghost" on:click={() => editor.outdent()}>
        Outdent
      </Button>
      <Button size="small" kind="ghost" on:click={() => editor.selectAll()}>
        Select all
      </Button>
      <Button
        size="small"
        kind="ghost"
        on:click={() => editor.insert("// TODO\n")}
        >Insert</Button
      >
      <Button size="small" kind="ghost" on:click={sortLines}>
        Sort lines (external)
      </Button>
      <Button
        size="small"
        kind="danger-tertiary"
        on:click={() => editor.clear()}
        >Clear</Button
      >
    </div>

    <div class="controls">
      <label class="control">
        <span class="label-01">Outline color</span>
        <input type="color" bind:value={outlineColor}>
      </label>
      <div class="control slider">
        <Slider
          labelText="Outline width (px)"
          min={0}
          max={6}
          step={1}
          maxLabel="6"
          bind:value={outlineWidth}
        />
      </div>
      <div class="control">
        <span class="label-01">Engine</span>
        <div class="engine-toggle">
          <Button
            size="small"
            kind={engine === "dom" ? "primary" : "tertiary"}
            on:click={() => (engine = "dom")}
            >dom</Button
          >
          <Button
            size="small"
            kind={engine === "css-highlights" ? "primary" : "tertiary"}
            on:click={() => (engine = "css-highlights")}
            >css-highlights</Button
          >
        </div>
      </div>
    </div>

    <!-- HighlightStyle stays mounted across engine toggles: it supplies the
    base `.hljs`/`pre code.hljs` layout rules (display, padding, overflow)
    for both engines. `theme` on HighlightEditable additionally generates
    the `::highlight()` token-color rules, only consumed in css-highlights
    mode. -->
    <HighlightStyle theme={githubDark}>
      <HighlightEditable
        bind:this={editor}
        language={typescript}
        bind:code
        {engine}
        theme={engine === "css-highlights" ? githubDark : undefined}
        --outline-color={outlineColor}
        --outline-width={`${outlineWidth}px`}
        on:change={(e) => (lastEvent = `change: ${e.detail.code.length} chars`)}
        on:blur={(e) => (lastEvent = `blur: ${e.detail.code.length} chars`)}
        on:history={(e) => (historyState = e.detail)}
      />
    </HighlightStyle>

    <p class="label-01" style="margin-top: 0.5rem">
      resolvedEngine(): <code class="code">{resolvedEngine}</code>
    </p>
  </Column>

  <Column xlg={10} lg={10} md={12} class="mb-5">
    <div class="label-01 mb-3">
      History stack ({historyState.entries.length}
      snapshots, at #{historyState.index})
    </div>
    <div class="history">
      {#each historyState.entries as entry, i}
        <div
          class="cell"
          class:current={i === historyState.index}
          class:future={i > historyState.index}
          title={`#${i} · ${entry.size} chars`}
        >
          <div class="bar" style:height={`${Math.min(100, entry.size)}%`}></div>
          <span class="num">{i}</span>
        </div>
      {/each}
    </div>

    <div class="label-01 mb-3" style="margin-top: 1.5rem">
      Live bound value (bind:code)
    </div>
    <pre class="bound">{code}</pre>

    <div class="label-01 mb-3" style="margin-top: 1rem">Last event</div>
    <code>{lastEvent}</code>
  </Column>
</Row>

<h3 class="mb-3">
  Same <code>bind:code</code> in other themes. Edits in one block show up in all
  of them.
</h3>
<Row class="mb-9">
  {#each sideThemes as { name, theme }}
    <Column xlg={10} lg={10} md={12} class="mb-5">
      <div class="label-01 mb-3">{name}</div>
      <HighlightStyle {theme}>
        <HighlightEditable
          language={typescript}
          bind:code
          --outline-color={outlineColor}
          --outline-width={`${outlineWidth}px`}
        />
      </HighlightStyle>
    </Column>
  {/each}
</Row>

<h3 class="mb-3">
  css-highlights engine: same <code>bind:code</code>, different themes side by
  side
</h3>
<p class="label-01 mb-3">
  Each instance registers its own <code>CSS.highlights</code> entries, so two
  editors on the same page can run different themes without one clobbering the
  other's colors.
</p>
<Row class="mb-9">
  {#each cssHighlightThemes as { name, theme }}
    <Column xlg={10} lg={10} md={12} class="mb-5">
      <div class="label-01 mb-3">{name}</div>
      <HighlightStyle {theme}>
        <HighlightEditable
          language={typescript}
          bind:code
          engine="css-highlights"
          {theme}
          --outline-color={outlineColor}
          --outline-width={`${outlineWidth}px`}
        />
      </HighlightStyle>
    </Column>
  {/each}
</Row>

<h3 class="mb-3">Rendered with LineNumbers</h3>
<Row class="mb-9">
  <Column xlg={12} class="mb-5">
    <HighlightStyle theme={githubDark}>
      <Highlight language={typescript} {code} let:highlighted let:languageName>
        <LineNumbers {highlighted} {languageName} />
      </Highlight>
    </HighlightStyle>
  </Column>
</Row>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .control {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .control input[type="color"] {
    width: 48px;
    height: 28px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
  }

  .engine-toggle {
    display: flex;
    gap: 0.25rem;
  }

  .history {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 120px;
    padding: 0.5rem;
    background: #161616;
    border-radius: 4px;
    overflow-x: auto;
  }

  .cell {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    min-width: 16px;
    height: 100%;
  }

  .bar {
    width: 14px;
    min-height: 2px;
    background: #4589ff;
    border-radius: 2px;
  }

  .cell.future .bar {
    background: #525252;
  }

  .cell.current .bar {
    background: #42be65;
    box-shadow: 0 0 0 2px #42be6566;
  }

  .num {
    margin-top: 2px;
    font-size: 9px;
    color: #8d8d8d;
  }

  .cell.current .num {
    color: #42be65;
  }

  .bound {
    padding: 1rem;
    background: #161616;
    color: #f4f4f4;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
