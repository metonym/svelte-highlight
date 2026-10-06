<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import {
    Button,
    Column,
    NumberInput,
    Row,
    Select,
    SelectItem,
  } from "carbon-components-svelte";
  import { onMount, tick } from "svelte";
  import { HighlightVirtual } from "svelte-highlight";
  import json from "svelte-highlight/languages/json";
  import typescript from "svelte-highlight/languages/typescript";
  import {
    generateJsonLog,
    generateTypeScript,
    trackRenderedLineCount,
  } from "../HighlightVirtual/generate-large-code.js";

  const SIZES = [100_000, 200_000, 500_000];
  const SHAPES = {
    typescript: {
      label: "TypeScript",
      language: typescript,
      generate: generateTypeScript,
    },
    json: { label: "JSON log", language: json, generate: generateJsonLog },
  };

  let size = SIZES[0];
  /** @type {keyof typeof SHAPES} */
  let shape = "typescript";

  let code = "";
  let language = SHAPES[shape].language;
  let generating = false;

  /** @type {{ generateMs: number; paintMs: number; bytes: number } | null} */
  let stats = null;
  /** Set while waiting for the first painted window of a new document. */
  let paintStart = 0;
  let pendingGenerateMs = 0;

  let win = { start: 0, end: 0, lineCount: 0 };
  let renderedLineCount = 0;
  let jumpTo = 0;
  /** @type {number | null} */
  let jumpMs = null;

  // The generators end with "\n", which the document counts as one more
  // (empty) line; leave it out of what the page shows and jumps to.
  $: lines = code.endsWith("\n") ? win.lineCount - 1 : win.lineCount;

  /** @type {HighlightVirtual} */
  let ref;

  async function load() {
    generating = true;
    stats = null;
    // Let the "Generating..." state paint before the synchronous work.
    await tick();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const t0 = performance.now();
    const next = SHAPES[shape].generate(size);
    pendingGenerateMs = performance.now() - t0;

    // Start the new file at the top, not at the old file's scroll offset.
    ref?.scrollToLine(0);
    paintStart = performance.now();
    jumpMs = null;
    language = SHAPES[shape].language;
    code = next;
    jumpTo = Math.floor(size / 2) + 1;
    generating = false;
  }

  // windowchange fires once the new rows are in the DOM; one more frame
  // covers layout and paint.
  function onWindowChange(event) {
    win = event.detail;
    if (!paintStart || win.lineCount === 0) return;
    const start = paintStart;
    paintStart = 0;
    requestAnimationFrame(() => {
      stats = {
        generateMs: pendingGenerateMs,
        paintMs: performance.now() - start,
        bytes: code.length,
      };
    });
  }

  // scrollToLine tokenizes up to the target synchronously, so timing the
  // call covers the work. The first jump far ahead pays for everything
  // before it once; checkpoints make later jumps cheap.
  /** @param {number} line */
  function jump(line) {
    if (!ref) return;
    const t0 = performance.now();
    ref.scrollToLine(line, { align: "center" });
    jumpMs = performance.now() - t0;
  }

  const formatMs = (/** @type {number} */ ms) =>
    ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(2)} s`;
  const formatMb = (/** @type {number} */ bytes) =>
    `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  onMount(load);
</script>

<Row class="mb-7">
  <Column xlg={12}>
    <p class="mb-5" style="max-width: 48rem">
      <code class="code">HighlightVirtual</code>
      tokenizes only what you scroll to, from checkpoints spaced through the
      document, and keeps a couple dozen line nodes in the DOM no matter how
      long the file is. Pick a size, load it, and jump around. The file is
      generated in your browser. The first jump far ahead tokenizes everything
      before it once, so it takes longer on the biggest files; jumps back are
      instant.
    </p>
  </Column>
</Row>

<Row class="mb-5">
  <Column xlg={12}>
    <div
      style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 1rem"
    >
      <Select labelText="Lines" bind:selected={size} size="sm">
        {#each SIZES as option}
          <SelectItem value={option} text={option.toLocaleString()} />
        {/each}
      </Select>
      <Select labelText="Shape" bind:selected={shape} size="sm">
        {#each Object.entries(SHAPES) as [value, { label }]}
          <SelectItem {value} text={label} />
        {/each}
      </Select>
      <Button size="small" on:click={load} disabled={generating}>
        {generating ? "Generating..." : "Load"}
      </Button>
    </div>
  </Column>
</Row>

<Row class="mb-5">
  <Column xlg={12}>
    <dl class="stats" data-testid="large-file-stats">
      <div>
        <dt>Lines</dt>
        <dd>{lines > 0 ? lines.toLocaleString() : "-"}</dd>
      </div>
      <div>
        <dt>Size</dt>
        <dd>{stats ? formatMb(stats.bytes) : "-"}</dd>
      </div>
      <div>
        <dt>Generate</dt>
        <dd>{stats ? formatMs(stats.generateMs) : "-"}</dd>
      </div>
      <div>
        <dt>First paint</dt>
        <dd data-testid="first-paint">
          {stats ? formatMs(stats.paintMs) : "-"}
        </dd>
      </div>
      <div>
        <dt>Last jump</dt>
        <dd data-testid="last-jump">
          {jumpMs === null ? "-" : formatMs(jumpMs)}
        </dd>
      </div>
      <div>
        <dt>Line nodes in DOM</dt>
        <dd>{renderedLineCount}</dd>
      </div>
      <div>
        <dt>Window</dt>
        <dd>
          {lines > 0
            ? `${(win.start + 1).toLocaleString()}-${Math.min(win.end, lines).toLocaleString()}`
            : "-"}
        </dd>
      </div>
    </dl>
  </Column>
</Row>

<Row class="mb-5">
  <Column xlg={12}>
    <div
      style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 0.5rem"
    >
      <Button size="small" kind="tertiary" on:click={() => jump(0)}>
        Start
      </Button>
      <Button
        size="small"
        kind="tertiary"
        on:click={() => jump(Math.floor(lines / 2))}
      >
        Middle
      </Button>
      <Button
        size="small"
        kind="tertiary"
        on:click={() => jump(Math.max(0, lines - 1))}
      >
        End
      </Button>
      <NumberInput
        id="large-file-jump"
        size="sm"
        min={1}
        max={Math.max(1, lines)}
        bind:value={jumpTo}
        label="Line"
        hideSteppers
      />
      <Button
        size="small"
        kind="tertiary"
        on:click={() => jump(Math.max(0, (jumpTo ?? 1) - 1))}
      >
        Go
      </Button>
    </div>
  </Column>
</Row>

<Row>
  <Column xlg={12}>
    <div use:trackRenderedLineCount={(n) => (renderedLineCount = n)}>
      <HighlightVirtual
        bind:this={ref}
        {language}
        {code}
        class={THEME_MODULE_NAME}
        style="height: 480px"
        on:windowchange={onWindowChange}
      />
    </div>
  </Column>
</Row>

<style>
  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
  }

  .stats dt {
    font-size: 0.75rem;
    color: var(--cds-text-secondary, #c6c6c6);
  }

  .stats dd {
    font-family: var(--cds-code-01-font-family, monospace);
    font-size: 1rem;
  }
</style>
