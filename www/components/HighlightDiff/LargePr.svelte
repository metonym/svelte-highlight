<script>
  import { onDestroy, tick } from "svelte";
  import { parsePatch } from "svelte-highlight";
  import PrFile from "./PrFile.svelte";

  const ranges = ["v7.22.0..v7.23.1", "v7.21.0..v7.23.1", "v7.20.0..v7.23.1"];

  let rangeIndex = 0;
  /** @type {"windowed" | "lazy" | "eager"} */
  let mode = "windowed";
  /** @type {import("svelte-highlight/diff-edits").FilePatch[]} */
  let files = [];
  /** @type {boolean[]} */
  let mounted = [];
  /** Last rendered height per file, so an unmounted file keeps its space. */
  /** @type {number[]} */
  let heights = [];
  let loading = false;
  let metrics = {
    fetchMs: 0,
    parseMs: 0,
    firstPaintMs: 0,
    longTasks: 0,
    longTaskMs: 0,
    domNodes: 0,
  };

  /** @type {PerformanceObserver | undefined} */
  let observer;
  /** @type {HTMLElement} */
  let list;

  function watchLongTasks() {
    observer?.disconnect();
    metrics.longTasks = 0;
    metrics.longTaskMs = 0;
    if (!PerformanceObserver.supportedEntryTypes?.includes("longtask")) return;
    observer = new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        metrics.longTasks++;
        metrics.longTaskMs += entry.duration;
      }
    });
    observer.observe({ type: "longtask" });
  }

  async function load() {
    loading = true;
    files = [];
    mounted = [];
    heights = [];
    await tick();
    const t0 = performance.now();
    const { patch } = await (
      await fetch(`/diff-data/range-${rangeIndex}.json`)
    ).json();
    const t1 = performance.now();
    const parsed = parsePatch(patch);
    const t2 = performance.now();
    watchLongTasks();
    files = parsed;
    mounted = parsed.map(() => mode === "eager");
    loading = false;
    await tick();
    // Two frames: the browser has painted what was mounted.
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
    metrics = {
      ...metrics,
      fetchMs: t1 - t0,
      parseMs: t2 - t1,
      firstPaintMs: performance.now() - t2,
    };
  }

  /** Roughly how tall a file's diff will be before it mounts. */
  function estimate(
    /** @type {import("svelte-highlight/diff-edits").FilePatch} */ f,
  ) {
    const lines = f.hunks.reduce((n, h) => n + h.lines.length + 1, 0);
    return Math.min(640, Math.max(40, lines * 18));
  }

  /**
   * Mounts a file when it comes within a screen of the viewport. In
   * "windowed" mode, also unmounts it once it's far away, keeping its
   * measured height so the page doesn't jump.
   * @param {HTMLElement} node
   * @param {number} index
   */
  function track(node, index) {
    const io = new IntersectionObserver(
      (entries) => {
        const near = entries.some((e) => e.isIntersecting);
        if (near && !mounted[index]) {
          mounted[index] = true;
          if (mode !== "windowed") io.disconnect();
        } else if (!near && mounted[index] && mode === "windowed") {
          const body = node.querySelector(".shl-diff");
          if (body) heights[index] = body.getBoundingClientRect().height;
          mounted[index] = false;
        }
      },
      { rootMargin: "1500px 0px" },
    );
    io.observe(node);
    return { destroy: () => io.disconnect() };
  }

  const timer = setInterval(() => {
    if (list) metrics.domNodes = list.getElementsByTagName("*").length;
  }, 500);

  $: mountedCount = mounted.filter(Boolean).length;
  $: totals = files.reduce(
    (t, f) => ({ add: t.add + f.additions, del: t.del + f.deletions }),
    { add: 0, del: 0 },
  );

  onDestroy(() => {
    clearInterval(timer);
    observer?.disconnect();
  });
</script>

<p class="label-01 mb-3">
  A real release range from this repo, shown as one long page of per-file diffs,
  like a large pull request. "Eager" mounts every file at once. "Lazy" mounts
  each file as it nears the viewport. "Windowed" also unmounts files far from
  it. Rendered from the patch alone, as a code host would.
</p>

<div class="controls">
  <select bind:value={rangeIndex}>
    {#each ranges as range, i}
      <option value={i}>{range}</option>
    {/each}
  </select>
  <select bind:value={mode}>
    <option value="windowed">windowed (mount near, unmount far)</option>
    <option value="lazy">lazy mount (never unmount)</option>
    <option value="eager">eager mount (slow on big ranges)</option>
  </select>
  <button type="button" on:click={load} disabled={loading}>
    {loading ? "Loading…" : "Load"}
  </button>
</div>

{#if files.length}
  <div class="metrics label-01" data-testid="pr-metrics">
    {files.length}
    files · <span class="add">+{totals.add}</span>
    <span class="del">−{totals.del}</span> · mounted {mountedCount} · DOM nodes
    {metrics.domNodes.toLocaleString()} · fetch {metrics.fetchMs.toFixed(0)} ms
    · parse {metrics.parseMs.toFixed(0)} ms · first paint
    {metrics.firstPaintMs.toFixed(0)} ms · long tasks
    {metrics.longTasks} ({metrics.longTaskMs.toFixed(0)}
    ms)
  </div>
{/if}

<div class="list" bind:this={list}>
  {#each files as f, i (`${f.oldPath}:${f.newPath}:${i}`)}
    <section class="file" use:track={i}>
      <header>
        <span class="path"
          >{f.oldPath !== f.newPath && f.status === "renamed"
            ? `${f.oldPath} → `
            : ""}{f.newPath}</span
        >
        <span
          ><span class="add">+{f.additions}</span>
          <span class="del">−{f.deletions}</span> · {f.status}</span
        >
      </header>
      {#if f.status === "binary" || f.hunks.length === 0}
        <p class="empty">
          {f.status === "binary" ? "Binary file" : "No content changes"}
        </p>
      {:else if mounted[i]}
        <PrFile file={f} />
      {:else}
        <div
          class="placeholder"
          style="height: {heights[i] ?? estimate(f)}px"
        ></div>
      {/if}
    </section>
  {/each}
</div>

<style>
  .controls {
    display: flex;
    gap: 8px;
    margin-bottom: 0.75rem;
  }

  .controls select,
  .controls button {
    background: #262626;
    color: inherit;
    border: 1px solid #525252;
    padding: 4px 8px;
    font: inherit;
  }

  .metrics {
    position: sticky;
    top: 48px;
    z-index: 2;
    padding: 6px 10px;
    margin-bottom: 0.75rem;
    background: #262626;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .file {
    border: 1px solid #393939;
  }

  header {
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    font-size: 12px;
    background: #1f1f1f;
    border-bottom: 1px solid #393939;
  }

  .path {
    font-family: monospace;
  }

  .placeholder {
    background: repeating-linear-gradient(
      -45deg,
      transparent 0 8px,
      #222 8px 9px
    );
  }

  .empty {
    padding: 8px 10px;
    color: #8d8d8d;
    font-size: 12px;
  }

  .add {
    color: #3fb950;
  }

  .del {
    color: #f85149;
  }
</style>
