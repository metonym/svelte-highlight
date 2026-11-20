<script>
  /**
   * Growing code buffer; chunks may split mid-token or mid-line.
   * @type {string}
   */
  export let code = "";

  /** @type {import("./languages").LanguageType<string>} */
  export let language;

  /**
   * Stream finished: hides the caret and performs one final full highlight.
   * @type {boolean}
   */
  export let done = false;

  /**
   * Show a blinking caret at the end of output while `!done`.
   * @type {boolean}
   */
  export let caret = true;

  /**
   * Stick to the bottom while streaming, unless the user scrolls away.
   * @type {boolean}
   */
  export let autoScroll = false;

  /**
   * Render only the lines in the viewport (plus `overscan`). Output stays the
   * streaming parse even once `done`, and `on:highlight` is not dispatched.
   * @type {boolean}
   */
  export let virtualize = false;

  /**
   * Extra lines rendered above and below the viewport when `virtualize` is set.
   * @type {number}
   */
  export let overscan = 12;

  /**
   * Lines between engine checkpoints when `virtualize` is set.
   * @type {number}
   */
  export let checkpointInterval = 100;

  /**
   * Announced by a polite live region once `done`. Set to `""` to disable.
   * @type {string}
   */
  export let doneText = "Code finished streaming";

  import { createEventDispatcher, onMount, tick } from "svelte";
  import { createStreamView } from "./stream.js";
  import { createStreamHighlighter } from "./stream-highlighter.js";
  import { createTokenizedDocument } from "./tokenized-document.js";
  import { watchLineHeight, windowRange } from "./virtual-window.js";

  const dispatch = createEventDispatcher();

  /** @type {HTMLElement} */
  let container;

  /** @type {HTMLElement | null} */
  let codeElement = null;

  /** @type {ReturnType<typeof createStreamView> | undefined} */
  let view;
  /** @type {HTMLElement | null} */
  let viewElement = null;

  // Server and pre-mount markup only. After mount, `view` owns `<code>`.
  /** @type {string} */
  let highlighted = "";

  let mounted = false;

  // Reset when `done` goes false so a restarted stream fires `done` again.
  let doneDispatched = false;

  let stickToBottom = true;

  /** @type {HTMLElement} */
  let probe;
  let vLineHeight = 16;
  let vScrollTop = 0;
  let vClientHeight = 0;
  /** @type {ReturnType<typeof requestAnimationFrame> | undefined} */
  let vFrame;
  /** @type {ResizeObserver | undefined} */
  let resizeObserver;
  /** @type {ReturnType<typeof createTokenizedDocument> | undefined} */
  let vdoc;
  let vdocLanguageName = "";
  let vdocCheckpointInterval;
  let vLineCount = 0;
  let vStart = 0;
  let vEnd = 0;
  /** @type {string[]} */
  let vVisibleLines = [];
  // Last `windowchange` detail, to skip re-dispatching an unchanged window.
  /** @type {number | undefined} */
  let dispatchedWindowStart;
  /** @type {number | undefined} */
  let dispatchedWindowEnd;
  /** @type {number | undefined} */
  let dispatchedWindowLineCount;

  /** @type {ReturnType<typeof createStreamHighlighter> | undefined} */
  let serverHighlighter = createStreamHighlighter();

  function renderBeforeMount() {
    if (!serverHighlighter) return;
    const state = done
      ? serverHighlighter.finish(code, language)
      : serverHighlighter.update(code, language);
    highlighted = state.highlighted;
    dispatch("highlight", { highlighted });
  }

  /** @param {HTMLElement | null} element */
  function attachView(element) {
    if (element === viewElement) return;
    view?.destroy();
    view = undefined;
    viewElement = element;
    if (!element) return;
    // The view has its own state from here on.
    serverHighlighter = undefined;
    highlighted = "";
    view = createStreamView(element, {
      code,
      language,
      done,
      caret,
      autoScroll,
      onHighlight: (html) => dispatch("highlight", { highlighted: html }),
      onDone: () => dispatch("done"),
    });
  }

  function onScroll() {
    if (!container || !virtualize) return;
    const gap =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    stickToBottom = gap <= 4;
    scheduleVirtualRepaint();
  }

  function ensureVirtualDoc() {
    if (
      vdoc &&
      vdocLanguageName === language.name &&
      vdocCheckpointInterval === checkpointInterval
    ) {
      return;
    }
    vdoc = createTokenizedDocument({ language, checkpointInterval });
    vdocLanguageName = language.name;
    vdocCheckpointInterval = checkpointInterval;
  }

  function computeVirtualWindow() {
    if (!vdoc) return;
    const total = vdoc.lineCount();
    vLineCount = total;
    ({ start: vStart, end: vEnd } = windowRange({
      scrollTop: vScrollTop,
      clientHeight: vClientHeight,
      lineHeight: vLineHeight,
      overscan,
      total,
    }));
    vVisibleLines = vdoc.lineRange(vStart, vEnd);

    if (
      vStart !== dispatchedWindowStart ||
      vEnd !== dispatchedWindowEnd ||
      vLineCount !== dispatchedWindowLineCount
    ) {
      dispatchedWindowStart = vStart;
      dispatchedWindowEnd = vEnd;
      dispatchedWindowLineCount = vLineCount;
      // Dispatch once the new rows are in the DOM.
      const detail = { start: vStart, end: vEnd, lineCount: vLineCount };
      tick().then(() => dispatch("windowchange", detail));
    }
  }

  /**
   * Scroll a given line into the rendered window.
   * @param {number} line
   */
  export function scrollToLine(line) {
    if (!container) return;
    if (virtualize) {
      const target = Math.max(0, Math.min(line, vLineCount)) * vLineHeight;
      const maxScrollTop = Math.max(
        0,
        container.scrollHeight - container.clientHeight,
      );
      container.scrollTop = Math.max(0, Math.min(target, maxScrollTop));
      vScrollTop = container.scrollTop;
      computeVirtualWindow();
    } else {
      container
        .querySelector(`[data-line="${line}"]`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }

  // Stick to the growing bottom, or clamp scrollTop if the document shrank.
  async function syncVirtualFromContainer() {
    await tick();
    if (!container) return;
    if (autoScroll && stickToBottom) {
      container.scrollTop = container.scrollHeight;
    } else {
      const maxScrollTop = Math.max(
        0,
        container.scrollHeight - container.clientHeight,
      );
      if (container.scrollTop > maxScrollTop) {
        container.scrollTop = maxScrollTop;
      }
    }
    vScrollTop = container.scrollTop;
    vClientHeight = container.clientHeight;
  }

  function cancelVirtualFrame() {
    if (vFrame != null) {
      cancelAnimationFrame(vFrame);
      vFrame = undefined;
    }
  }

  // Coalesce scroll bursts into one window recompute per frame.
  function scheduleVirtualRepaint() {
    if (vFrame != null) return;
    vFrame = requestAnimationFrame(() => {
      vFrame = undefined;
      if (container) vScrollTop = container.scrollTop;
    });
  }

  function measureVirtualLineHeight() {
    return watchLineHeight(
      () => probe,
      () => vLineHeight,
      (height) => (vLineHeight = height),
      tick,
    );
  }

  // SSR and pre-mount: one synchronous pass for the initial markup.
  $: if (!virtualize && !mounted) {
    void code;
    void language;
    void done;
    renderBeforeMount();
  }

  $: attachView(virtualize ? null : codeElement);
  $: view?.update({ code, language, done, caret, autoScroll });

  // Virtual rendering is handled by the blocks below; only dispatch `done`.
  $: if (virtualize) {
    if (mounted && done) {
      if (!doneDispatched) {
        doneDispatched = true;
        dispatch("done");
      }
    } else {
      doneDispatched = false;
    }
  }

  // Kept separate from the scroll block so scrolling never calls setCode().
  $: if (virtualize && mounted) {
    void code;
    void language;
    void checkpointInterval;
    ensureVirtualDoc();
    vdoc.setCode(code);
    vLineCount = vdoc.lineCount();
    computeVirtualWindow();
    syncVirtualFromContainer();
  }

  $: if (virtualize && mounted) {
    void overscan;
    void vLineHeight;
    void vScrollTop;
    void vClientHeight;
    void vLineCount;
    computeVirtualWindow();
  }

  $: showCaret = mounted && !done && caret;

  onMount(() => {
    mounted = true;
    if (virtualize) {
      measureVirtualLineHeight();
      syncVirtualFromContainer();
      if (typeof ResizeObserver !== "undefined" && container) {
        resizeObserver = new ResizeObserver(() => {
          if (container) vClientHeight = container.clientHeight;
        });
        resizeObserver.observe(container);
      }
    }
    return () => {
      view?.destroy();
      cancelVirtualFrame();
      resizeObserver?.disconnect();
    };
  });
</script>

{#if virtualize}
  <pre
    bind:this={container}
    class:hljs={true}
    class:shl-virtual={true}
    aria-busy={!done}
    on:scroll={onScroll}
    {...$$restProps}
  ><code>{#if !mounted}{code}{:else}<span class="shl-virtual-sizer" style="height: {vLineCount * vLineHeight}px;"><span class="shl-virtual-window" style="transform: translateY({vStart * vLineHeight}px);">{#each vVisibleLines as line, i (vStart + i)}<span class="highlight-stream-line" data-line={vStart + i}>{@html line}</span>{#if showCaret && vEnd === vLineCount && i === vVisibleLines.length - 1}<span class="highlight-stream-caret" aria-hidden="true"></span>{/if}{"\n"}{/each}</span></span>{/if}</code><span
  bind:this={probe}
  class="shl-virtual-probe highlight-stream-line"
  aria-hidden="true"
>&nbsp;</span></pre>
{:else}
  <pre
    bind:this={container}
    aria-busy={!done}
    on:scroll={onScroll}
    {...$$restProps}
  >{#if mounted}<code bind:this={codeElement} class="hljs"></code>{:else}<code
    class:hljs={true}>{@html highlighted}</code
  >{/if}</pre>
{/if}

<span class="visually-hidden" role="status" aria-live="polite"
  >{done ? doneText : ""}</span
>

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

  .shl-virtual-probe {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Global: the stream view creates the caret outside the template. */
  :global(.highlight-stream-caret) {
    display: inline-block;
    width: var(--caret-width, 0.6em);
    height: var(--caret-height, 1.1em);
    margin-left: var(--caret-gap, 1px);
    vertical-align: text-bottom;
    background: var(--caret-color, currentColor);
    animation: highlight-stream-blink var(--caret-blink, 1s) step-end infinite;
  }

  @keyframes -global-highlight-stream-blink {
    50% {
      opacity: 0;
    }
  }
</style>
