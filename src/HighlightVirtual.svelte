<script>
  /**
   * Code to render.
   * @type {any}
   */
  export let code = "";

  /** @type {import("./languages").LanguageType<string>} */
  export let language;

  /**
   * Extra lines rendered above and below the viewport.
   * @type {number}
   */
  export let overscan = 12;

  /**
   * Lines between engine checkpoints.
   * @type {number}
   */
  export let checkpointInterval = 100;

  /**
   * Tokenize the rest of the document in idle time after the first paint,
   * so far jumps don't stall. Costs memory for the whole document up front.
   * @type {boolean}
   */
  export let tokenizeAhead = false;

  import { createEventDispatcher, onMount, tick } from "svelte";
  import { createTokenizedDocument } from "./tokenized-document.js";
  import { watchLineHeight, windowRange } from "./virtual-window.js";

  const dispatch = createEventDispatcher();

  /** @type {HTMLElement} */
  let container;

  /** @type {HTMLElement} */
  let probe;

  // Uniform line height, measured from the probe line.
  let lineHeight = 16;

  // Flips in onMount so the first client render matches the SSR markup.
  let hydrated = false;

  let scrollTop = 0;
  let clientHeight = 0;

  /** @type {ReturnType<typeof requestAnimationFrame> | undefined} */
  let frame;

  /** @type {ResizeObserver | undefined} */
  let resizeObserver;

  /** @type {ReturnType<typeof createTokenizedDocument> | undefined} */
  let doc;
  let docLanguageName = "";
  let docCheckpointInterval;

  let lineCount = 0;
  let start = 0;
  let end = 0;
  /** @type {string[]} */
  let visibleLines = [];

  // Last `windowchange` detail, to skip re-dispatching an unchanged window.
  /** @type {number | undefined} */
  let dispatchedWindowStart;
  /** @type {number | undefined} */
  let dispatchedWindowEnd;
  /** @type {number | undefined} */
  let dispatchedWindowLineCount;

  $: source = typeof code === "string" ? code : String(code ?? "");

  function ensureDoc() {
    if (
      doc &&
      docLanguageName === language.name &&
      docCheckpointInterval === checkpointInterval
    ) {
      return;
    }
    doc = createTokenizedDocument({ language, checkpointInterval });
    docLanguageName = language.name;
    docCheckpointInterval = checkpointInterval;
  }

  function computeWindow() {
    if (!doc) return;
    const total = doc.lineCount();
    lineCount = total;
    ({ start, end } = windowRange({
      scrollTop,
      clientHeight,
      lineHeight,
      overscan,
      total,
    }));
    visibleLines = doc.lineRange(start, end);

    if (
      start !== dispatchedWindowStart ||
      end !== dispatchedWindowEnd ||
      lineCount !== dispatchedWindowLineCount
    ) {
      dispatchedWindowStart = start;
      dispatchedWindowEnd = end;
      dispatchedWindowLineCount = lineCount;
      // Dispatch once the new rows are in the DOM, so listeners that paint
      // into them don't paint rows about to be replaced.
      const detail = { start, end, lineCount };
      tick().then(() => dispatch("windowchange", detail));
    }
  }

  // Clamps scrollTop if the document shrank past the current position.
  async function syncFromContainer() {
    await tick();
    if (!container) return;
    const maxScrollTop = Math.max(
      0,
      container.scrollHeight - container.clientHeight,
    );
    if (container.scrollTop > maxScrollTop) container.scrollTop = maxScrollTop;
    scrollTop = container.scrollTop;
    clientHeight = container.clientHeight;
  }

  function cancelFrame() {
    if (frame != null) {
      cancelAnimationFrame(frame);
      frame = undefined;
    }
  }

  // Coalesce scroll bursts into one window recompute per frame.
  function scheduleRepaint() {
    if (frame != null) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      if (container) scrollTop = container.scrollTop;
    });
  }

  function onScroll() {
    scheduleRepaint();
  }

  function measureLineHeight() {
    return watchLineHeight(
      () => probe,
      () => lineHeight,
      (height) => (lineHeight = height),
    );
  }

  // Kept separate from the scroll block so scrolling never calls setCode()
  // (an O(len) prefix check).
  $: if (hydrated) {
    void source;
    void language;
    void checkpointInterval;
    ensureDoc();
    doc.setCode(source);
    lineCount = doc.lineCount();
    computeWindow();
    syncFromContainer();
    scheduleTokenizeAhead();
  }

  $: if (hydrated) {
    if (tokenizeAhead) scheduleTokenizeAhead();
    else cancelTokenizeAhead();
  }

  const requestIdle =
    typeof requestIdleCallback === "function"
      ? (/** @type {IdleRequestCallback} */ callback) =>
          requestIdleCallback(callback, { timeout: 1000 })
      : (/** @type {IdleRequestCallback} */ callback) =>
          setTimeout(
            () => callback({ didTimeout: false, timeRemaining: () => 8 }),
            16,
          );
  const cancelIdle =
    typeof cancelIdleCallback === "function"
      ? cancelIdleCallback
      : clearTimeout;

  /** @type {any} */
  let aheadHandle;
  // Bumped on every (re)schedule so a stale callback stops.
  let aheadGeneration = 0;

  function cancelTokenizeAhead() {
    aheadGeneration++;
    if (aheadHandle !== undefined) cancelIdle(aheadHandle);
    aheadHandle = undefined;
  }

  function scheduleTokenizeAhead() {
    cancelTokenizeAhead();
    if (!tokenizeAhead || !doc) return;
    const generation = aheadGeneration;
    /** @param {IdleDeadline} deadline */
    const step = (deadline) => {
      aheadHandle = undefined;
      if (generation !== aheadGeneration || !doc) return;
      let done = false;
      // At least one batch per callback, so a busy page still progresses.
      do {
        done = doc.tokenizeThrough(doc.tokenizedThrough() + checkpointInterval);
      } while (!done && deadline.timeRemaining() > 2);
      dispatch("tokenize", {
        through: done ? doc.lineCount() : doc.tokenizedThrough(),
        lineCount: doc.lineCount(),
      });
      if (!done) aheadHandle = requestIdle(step);
    };
    aheadHandle = requestIdle(step);
  }

  $: if (hydrated) {
    void overscan;
    void lineHeight;
    void scrollTop;
    void clientHeight;
    void lineCount;
    computeWindow();
  }

  /**
   * Scroll a given line into the rendered window, without animation.
   * @param {number} line
   * @param {{ align?: "start" | "center" }} [options]
   */
  export function scrollToLine(line, options = {}) {
    if (!container) return;
    const lineTop = Math.max(0, Math.min(line, lineCount)) * lineHeight;
    const target =
      options.align === "center"
        ? lineTop - (container.clientHeight - lineHeight) / 2
        : lineTop;
    const maxScrollTop = Math.max(
      0,
      container.scrollHeight - container.clientHeight,
    );
    container.scrollTop = Math.max(0, Math.min(target, maxScrollTop));
    scrollTop = container.scrollTop;
    computeWindow();
  }

  onMount(() => {
    measureLineHeight();
    hydrated = true;
    syncFromContainer();

    if (typeof ResizeObserver !== "undefined" && container) {
      resizeObserver = new ResizeObserver(() => {
        if (container) clientHeight = container.clientHeight;
      });
      resizeObserver.observe(container);
    }

    return () => {
      cancelFrame();
      cancelTokenizeAhead();
      resizeObserver?.disconnect();
    };
  });
</script>

<pre
  bind:this={container}
  class:shl-virtual={true}
  class:hljs={true}
  on:scroll={onScroll}
  {...$$restProps}
><code>{#if !hydrated}{source}{:else}<span class="shl-virtual-sizer" style="height: {lineCount * lineHeight}px;"><span class="shl-virtual-window" style="transform: translateY({start * lineHeight}px);">{#each visibleLines as line, i (start + i)}<span class="shl-virtual-line" data-line={start + i}>{@html line}</span>{"\n"}{/each}</span></span>{/if}</code><span
  bind:this={probe}
  class="shl-virtual-probe shl-virtual-line"
  aria-hidden="true"
>&nbsp;</span></pre>

<style>
  .shl-virtual {
    display: block;
    position: relative;
    overflow: auto;
    /* biome-ignore lint/complexity/noImportantStyles: must beat a consumer inline style, not just cascade order */
    white-space: pre !important;
    margin: 0;
  }

  .shl-virtual-sizer {
    display: block;
    position: relative;
  }

  .shl-virtual-window {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .shl-virtual-line {
    display: inline;
  }

  .shl-virtual-probe {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
  }
</style>
