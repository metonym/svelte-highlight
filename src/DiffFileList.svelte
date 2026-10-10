<script>
  /**
   * @typedef {{
   *   key?: string,
   *   path: string,
   *   oldPath?: string,
   *   status?: "modified" | "added" | "deleted" | "renamed" | "binary",
   *   patch?: import("./diff-edits.js").FilePatch,
   *   before?: string,
   *   after?: string,
   *   language?: import("./languages").LanguageType<string>,
   * }} DiffFile
   */

  /**
   * Files to show, each a parsed patch (`patch`) or two texts
   * (`before`/`after`).
   * @type {DiffFile[]}
   */
  export let files = [];

  /** @type {"unified" | "split"} */
  export let view = "unified";

  /** Unchanged lines kept around each change. */
  export let context = 3;

  /** Highlight changed words inside paired lines. */
  export let wordDiff = true;

  /** Treat lines that differ only in whitespace as unchanged. */
  export let ignoreWhitespace = false;

  /** Wrap long lines instead of scrolling sideways. */
  export let wrap = false;

  /** Show accept/reject controls per change. */
  export let review = false;

  /** @type {"default" | "colorblind"} */
  export let palette = "default";

  /**
   * Tallest a file's diff grows before it scrolls on its own, in pixels.
   * `null` lets every file show in full.
   * @type {number | null}
   */
  export let maxHeight = 640;

  /**
   * Picks a language for a path. The default loads one by file extension
   * the first time a file mounts.
   * @type {(path: string) => import("./languages").LanguageType<string> | Promise<import("./languages").LanguageType<string> | undefined> | undefined}
   */
  export let languageFor = defaultLanguageFor;

  /**
   * `"windowed"` mounts files near the viewport and unmounts far ones,
   * keeping their height; `"lazy"` never unmounts; `"none"` mounts every
   * file up front (for printing or browser find on short lists).
   * @type {"windowed" | "lazy" | "none"}
   */
  export let windowing = "windowed";

  /** How far outside the viewport a file mounts. */
  export let rootMargin = "1500px 0px";

  /**
   * The scrolling element, if the list isn't in the page's scroll.
   * @type {Element | null}
   */
  export let root = null;

  /** Let readers collapse a file by clicking its header. */
  export let collapsible = true;

  import { onMount, tick } from "svelte";
  import DiffFileListItem from "./DiffFileListItem.svelte";
  import { languageNameForPath } from "./diff-languages.js";
  import { loadLanguage } from "./load-language.js";

  /** @param {string} path */
  function defaultLanguageFor(path) {
    const name = languageNameForPath(path);
    return name ? loadLanguage(name) : undefined;
  }

  // Before a file has rendered, its height is a guess from its size.
  const ESTIMATED_LINE = 18;

  /** @param {DiffFile} file @param {number} index */
  const keyOf = (file, index) =>
    file.key ?? `${index}\u0000${file.oldPath ?? file.path}\u0000${file.path}`;

  /** @type {Set<string>} */
  let mounted = new Set();
  /** @type {Map<string, number>} */
  let heights = new Map();
  /** @type {Map<string, { additions: number, deletions: number, changes: number }>} */
  let stats = new Map();
  /** @type {Set<string>} */
  let collapsed = new Set();

  /** @type {HTMLElement[]} */
  const sections = [];

  /** @param {DiffFile} file */
  function estimate(file) {
    const lines = file.patch
      ? file.patch.hunks.reduce((n, h) => n + h.lines.length + 1, 0)
      : Math.max(
          (file.before ?? "").split("\n").length,
          (file.after ?? "").split("\n").length,
        );
    const px = Math.max(1, lines) * ESTIMATED_LINE;
    return maxHeight === null ? px : Math.min(maxHeight, px);
  }

  /** @param {DiffFile} file */
  function isEmpty(file) {
    if (file.status === "binary") return true;
    if (file.patch) return file.patch.hunks.length === 0;
    return (file.before ?? "") === (file.after ?? "");
  }

  /**
   * @param {DiffFile} file
   * @param {string} key
   * @param {typeof stats} known stats from mounted files
   */
  function statsOf(file, key, known) {
    if (file.patch) {
      return {
        additions: file.patch.additions,
        deletions: file.patch.deletions,
        changes: file.patch.hunks.length,
      };
    }
    return known.get(key);
  }

  /** @param {string} key */
  function toggle(key) {
    if (!collapsible) return;
    const next = new Set(collapsed);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    collapsed = next;
  }

  /**
   * @param {string} key
   * @param {{ additions: number, deletions: number, changes: number }} value
   */
  function setStats(key, value) {
    const prev = stats.get(key);
    if (
      prev &&
      prev.additions === value.additions &&
      prev.deletions === value.deletions &&
      prev.changes === value.changes
    ) {
      return;
    }
    stats.set(key, value);
    stats = new Map(stats);
  }

  /** @type {IntersectionObserver | undefined} */
  let observer;

  // Files above the viewport change height as they mount or unmount (an
  // estimate becomes a measurement). Keep the first file in view where it
  // was: remember it on scroll, and after any resize scroll by however far
  // it moved. If the browser's own scroll anchoring already corrected it,
  // it hasn't moved and nothing happens.
  /** @type {ResizeObserver | undefined} */
  let resizer;
  /** @type {HTMLElement | null} */
  let anchor = null;
  let anchorTop = 0;
  // Where our own correction left the scroll, so its scroll event doesn't
  // re-anchor mid-correction.
  let correctedTo = Number.NaN;

  const viewTop = () => (root ? root.getBoundingClientRect().top : 0);
  const scrollPosition = () => (root ? root.scrollTop : window.scrollY);

  function onScroll() {
    if (scrollPosition() === correctedTo) {
      correctedTo = Number.NaN;
      return;
    }
    captureAnchor();
  }

  /** First file whose top is at or below the top of the view. */
  function captureAnchor() {
    const top = viewTop();
    let lo = 0;
    let hi = sections.length - 1;
    /** @type {HTMLElement | null} */
    let found = null;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const section = sections[mid];
      if (!section) break;
      if (section.getBoundingClientRect().top >= top - 1) {
        found = section;
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }
    anchor = found;
    anchorTop = found ? found.getBoundingClientRect().top : 0;
  }

  function onResize() {
    if (!anchor?.isConnected) return;
    const drift = anchor.getBoundingClientRect().top - anchorTop;
    if (Math.abs(drift) < 0.5) return;
    if (root) root.scrollTop += drift;
    else window.scrollBy(0, drift);
    correctedTo = scrollPosition();
    anchorTop = anchor.getBoundingClientRect().top;
  }

  /** @param {IntersectionObserverEntry[]} entries */
  function onIntersect(entries) {
    // Measure where the reader is before anything mounts or unmounts.
    captureAnchor();
    let changed = false;
    for (const entry of entries) {
      const el = /** @type {HTMLElement} */ (entry.target);
      const key = el.dataset.key;
      if (key === undefined) continue;
      if (entry.isIntersecting) {
        if (!mounted.has(key)) {
          mounted.add(key);
          changed = true;
        }
      } else if (windowing === "windowed" && mounted.has(key)) {
        const body = el.querySelector(".shl-diff-file-body");
        if (body) heights.set(key, body.getBoundingClientRect().height);
        mounted.delete(key);
        changed = true;
      }
    }
    if (changed) {
      mounted = new Set(mounted);
      heights = new Map(heights);
    }
  }

  /**
   * @param {HTMLElement} node
   * @param {string} key
   */
  function track(node, key) {
    node.dataset.key = key;
    observer?.observe(node);
    resizer?.observe(node);
    return {
      /** @param {string} next */
      update(next) {
        node.dataset.key = next;
      },
      destroy() {
        observer?.unobserve(node);
        resizer?.unobserve(node);
      },
    };
  }

  $: if (windowing === "none") {
    mounted = new Set(files.map(keyOf));
  }

  /**
   * Scroll a file's header into view. The files around it mount first, so
   * they have real heights before the reader sees them.
   * @param {number} index
   * @param {ScrollIntoViewOptions} [options]
   */
  export async function scrollToFile(index, options = { block: "start" }) {
    if (!files[index]) return;
    const next = new Set(mounted);
    for (
      let i = Math.max(0, index - 3);
      i <= Math.min(files.length - 1, index + 3);
      i++
    ) {
      next.add(keyOf(/** @type {DiffFile} */ (files[i]), i));
    }
    if (next.size !== mounted.size) {
      mounted = next;
      await tick();
      // One frame, so the new files lay out and measure their rows.
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    sections[index]?.scrollIntoView(options);
    captureAnchor();
  }

  onMount(() => {
    if (typeof IntersectionObserver === "undefined") {
      mounted = new Set(files.map(keyOf));
      return;
    }
    observer = new IntersectionObserver(onIntersect, { root, rootMargin });
    if (typeof ResizeObserver !== "undefined") {
      resizer = new ResizeObserver(onResize);
    }
    const scroller = root ?? window;
    scroller.addEventListener("scroll", onScroll, { passive: true });
    captureAnchor();
    for (const section of sections) {
      if (!section) continue;
      observer.observe(section);
      resizer?.observe(section);
    }
    return () => {
      observer?.disconnect();
      resizer?.disconnect();
      scroller.removeEventListener("scroll", onScroll);
    };
  });

  $: options = { view, context, wordDiff, ignoreWhitespace };
  $: viewProps = {
    wrap,
    review,
    palette,
    style:
      maxHeight === null
        ? "height: auto;"
        : `height: auto; max-height: ${maxHeight}px;`,
  };

  const statusLabel = {
    modified: "Modified",
    added: "Added",
    deleted: "Deleted",
    renamed: "Renamed",
    binary: "Binary",
  };
</script>

<div class="shl-diff-file-list shl-diff-theme" {...$$restProps}>
  {#each files as file, index (keyOf(file, index))}
    {@const key = keyOf(file, index)}
    {@const fileStats = statsOf(file, key, stats)}
    {@const isCollapsed = collapsed.has(key)}
    <section
      class="shl-diff-file"
      class:shl-diff-file-collapsed={isCollapsed}
      bind:this={sections[index]}
      use:track={key}
      aria-label={file.path}
    >
      <slot
        name="header"
        {file}
        {index}
        stats={fileStats}
        collapsed={isCollapsed}
        toggle={() => toggle(key)}
      >
        <button
          type="button"
          class="shl-diff-file-header"
          aria-expanded={!isCollapsed}
          disabled={!collapsible}
          on:click={() => toggle(key)}
        >
          {#if collapsible}
            <span class="shl-diff-file-chevron" aria-hidden="true">▾</span>
          {/if}
          <span class="shl-diff-file-path">
            {file.status === "renamed" && file.oldPath
              ? `${file.oldPath} → ${file.path}`
              : file.path}
          </span>
          {#if file.status && file.status !== "modified"}
            <span class="shl-diff-file-status">{statusLabel[file.status]}</span>
          {/if}
          {#if fileStats}
            <span class="shl-diff-file-stats">
              <span class="shl-diff-file-add">+{fileStats.additions}</span>
              <span class="shl-diff-file-del">−{fileStats.deletions}</span>
            </span>
          {/if}
        </button>
      </slot>
      {#if !isCollapsed}
        {#if isEmpty(file)}
          <p class="shl-diff-file-empty">
            {file.status === "binary" ? "Binary file not shown" : "No changes"}
          </p>
        {:else if mounted.has(key)}
          <div class="shl-diff-file-body">
            <DiffFileListItem
              {file}
              {languageFor}
              {options}
              {viewProps}
              onStats={(value) => setStats(key, value)}
            />
          </div>
        {:else}
          <div
            class="shl-diff-file-placeholder"
            style="height: {heights.get(key) ?? estimate(file)}px;"
          ></div>
        {/if}
      {/if}
    </section>
  {/each}
</div>

<style>
  .shl-diff-file-list {
    overflow-anchor: none;
    display: flex;
    flex-direction: column;
    gap: var(--shl-diff-file-gap, 12px);
  }

  .shl-diff-file {
    border: 1px solid var(--shl-diff-rule, rgba(128, 128, 128, 0.25));
    border-radius: var(--shl-diff-file-radius, 6px);
    overflow: hidden;
  }

  .shl-diff-file-header {
    display: flex;
    align-items: center;
    gap: 1ch;
    width: 100%;
    padding: 6px 10px;
    border: 0;
    border-bottom: 1px solid var(--shl-diff-rule, rgba(128, 128, 128, 0.25));
    background: var(--shl-diff-file-header-background, transparent);
    color: inherit;
    font: inherit;
    font-size: 0.85em;
    text-align: left;
    cursor: pointer;
  }

  .shl-diff-file-header:disabled {
    cursor: default;
  }

  .shl-diff-file-collapsed .shl-diff-file-header {
    border-bottom: 0;
  }

  .shl-diff-file-chevron {
    transition: transform 0.1s;
  }

  .shl-diff-file-collapsed .shl-diff-file-chevron {
    transform: rotate(-90deg);
  }

  .shl-diff-file-path {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--shl-diff-font, ui-monospace, Menlo, Consolas, monospace);
  }

  .shl-diff-file-status {
    padding: 0 6px;
    border-radius: 3px;
    border: 1px solid currentColor;
    opacity: 0.7;
    font-size: 0.9em;
  }

  .shl-diff-file-add {
    color: var(--shl-diff-add-accent, #3fb950);
  }

  .shl-diff-file-del {
    color: var(--shl-diff-del-accent, #f85149);
  }

  .shl-diff-file-empty {
    margin: 0;
    padding: 8px 10px;
    opacity: 0.6;
    font-size: 0.85em;
  }

  .shl-diff-file-placeholder {
    background: var(
      --shl-diff-file-placeholder,
      repeating-linear-gradient(
        -45deg,
        transparent 0 8px,
        rgba(128, 128, 128, 0.08) 8px 9px
      )
    );
  }

  @media (prefers-reduced-motion: reduce) {
    .shl-diff-file-chevron {
      transition: none;
    }
  }
</style>
