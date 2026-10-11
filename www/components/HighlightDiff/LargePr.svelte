<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { onDestroy, tick } from "svelte";
  import { DiffFileList, parsePatch } from "svelte-highlight";

  const ranges = ["v7.22.0..v7.23.1", "v7.21.0..v7.23.1", "v7.20.0..v7.23.1"];

  let rangeIndex = 0;
  /** @type {"windowed" | "lazy" | "none"} */
  let windowing = "windowed";
  /** @type {"unified" | "split"} */
  let view = "unified";
  /** @type {import("svelte-highlight").DiffFile[]} */
  let files = [];
  let loading = false;
  let metrics = {
    fetchMs: 0,
    parseMs: 0,
    firstPaintMs: 0,
    longTasks: 0,
    longTaskMs: 0,
    domNodes: 0,
    mounted: 0,
  };

  /** @type {DiffFileList} */
  let list;
  /** @type {HTMLElement} */
  let wrapper;
  let jumpTo = 1;

  /** @type {PerformanceObserver | undefined} */
  let observer;

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
    await tick();
    const t0 = performance.now();
    const { patch } = await (
      await fetch(`/diff-data/range-${rangeIndex}.json`)
    ).json();
    const t1 = performance.now();
    const parsed = parsePatch(patch);
    const t2 = performance.now();
    watchLongTasks();
    files = parsed.map((p) => ({
      path: p.newPath,
      oldPath: p.oldPath,
      status: p.status,
      patch: p,
    }));
    loading = false;
    await tick();
    // Two frames: the browser has painted what mounted.
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

  const timer = setInterval(() => {
    if (!wrapper) return;
    metrics.domNodes = wrapper.getElementsByTagName("*").length;
    metrics.mounted = wrapper.querySelectorAll(".shl-diff-file-body").length;
  }, 500);

  $: totals = files.reduce(
    (t, f) => ({
      add: t.add + (f.patch?.additions ?? 0),
      del: t.del + (f.patch?.deletions ?? 0),
    }),
    { add: 0, del: 0 },
  );

  onDestroy(() => {
    clearInterval(timer);
    observer?.disconnect();
  });
</script>

<p class="label-01 mb-3">
  A real release range from this repo, shown with
  <code class="code">DiffFileList</code>, rendered from the patch alone like a
  code host would. "Windowed" (the default) mounts files near the viewport and
  unmounts far ones; "lazy" never unmounts; "none" mounts everything up front.
</p>

<div class="controls">
  <select bind:value={rangeIndex}>
    {#each ranges as range, i}
      <option value={i}>{range}</option>
    {/each}
  </select>
  <select bind:value={windowing}>
    <option value="windowed">windowed (default)</option>
    <option value="lazy">lazy (never unmount)</option>
    <option value="none">none (slow on big ranges)</option>
  </select>
  <select bind:value={view}>
    <option value="unified">unified</option>
    <option value="split">split</option>
  </select>
  <button type="button" on:click={load} disabled={loading}>
    {loading ? "Loading…" : "Load"}
  </button>
  {#if files.length}
    <input type="number" min="1" max={files.length} bind:value={jumpTo}>
    <button type="button" on:click={() => list.scrollToFile(jumpTo - 1)}>
      Jump to file
    </button>
  {/if}
</div>

{#if files.length}
  <div class="metrics label-01" data-testid="pr-metrics">
    {files.length}
    files ·
    <span class="add">+{totals.add}</span>
    <span class="del">−{totals.del}</span>
    · mounted {metrics.mounted} · DOM nodes {metrics.domNodes.toLocaleString()}
    · fetch {metrics.fetchMs.toFixed(0)} ms · parse {metrics.parseMs.toFixed(0)}
    ms · first paint {metrics.firstPaintMs.toFixed(0)} ms · long tasks
    {metrics.longTasks}
    ({metrics.longTaskMs.toFixed(0)}
    ms)
  </div>
{/if}

<div bind:this={wrapper}>
  {#key windowing}
    <DiffFileList
      bind:this={list}
      {files}
      {windowing}
      {view}
      class={THEME_MODULE_NAME}
    />
  {/key}
</div>

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 0.75rem;
  }

  .controls select,
  .controls button,
  .controls input {
    background: #262626;
    color: inherit;
    border: 1px solid #525252;
    padding: 4px 8px;
    font: inherit;
  }

  .controls input {
    width: 6em;
  }

  .metrics {
    position: sticky;
    top: 48px;
    z-index: 2;
    padding: 6px 10px;
    margin-bottom: 0.75rem;
    background: #262626;
  }

  .add {
    color: #3fb950;
  }

  .del {
    color: #f85149;
  }
</style>
