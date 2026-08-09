<script>
  /**
   * Growing code buffer. Append chunks as they arrive; arbitrary chunk
   * boundaries (mid-token, mid-line) are handled.
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
   * Keep the container scrolled to the bottom while streaming, unless the
   * user has scrolled away from the bottom.
   * @type {boolean}
   */
  export let autoScroll = false;

  /**
   * Render only the lines within the scrolled viewport (plus `overscan`)
   * instead of the whole growing buffer, so a long-running stream costs a
   * bounded number of DOM nodes instead of one per line. Backed by
   * `createTokenizedDocument` rather than the default sealed-chunk session,
   * so output always reflects the streaming (non-canonicalized) parse, even
   * once `done` - the same tradeoff `HighlightVirtual` makes. `on:highlight`
   * is not dispatched in this mode, since materializing the full HTML on
   * every repaint would defeat the point of windowing.
   * @type {boolean}
   */
  export let virtualize = false;

  /**
   * Extra lines rendered above and below the viewport when `virtualize` is
   * set.
   * @type {number}
   */
  export let overscan = 12;

  /**
   * Lines between engine checkpoints when `virtualize` is set (forwarded to
   * `createTokenizedDocument`).
   * @type {number}
   */
  export let checkpointInterval = 100;

  import { createEventDispatcher, onMount, tick } from "svelte";
  import { extendLines } from "./engine.js";
  import { ensureRegistered, registry } from "./registry.js";
  import { createCompletedHtmlBuffer } from "./stream-highlighted.js";
  import { createTokenizedDocument } from "./tokenized-document.js";
  import { watchLineHeight, windowRange } from "./virtual-window.js";

  // Lines between sealed chunks. Once a chunk fills, its line spans are
  // joined into one immutable HTML string and never touched again - keyed
  // reconciliation for `{#each sealedChunks}` below only ever diffs the
  // (constant-size) unsealed tail, not the whole stream.
  const SEAL_CHUNK_LINES = 256;

  const dispatch = createEventDispatcher();

  /** @type {HTMLElement} */
  let container;

  /** @type {string} */
  let highlighted = "";

  /** @type {ReturnType<typeof requestAnimationFrame> | undefined} */
  let frame;

  let mounted = false;

  // Guards against re-dispatching `done` on every reactive re-run while it
  // stays true; resets so a later restart (done set back to `false`) fires
  // it again next time the stream finishes.
  let doneDispatched = false;

  // Stick to bottom until the user scrolls away from it.
  let stickToBottom = true;

  // `virtualize` state: a random-access tokenized document (rather than the
  // sealed-chunk session above) windowed the same way `HighlightVirtual`
  // windows a static document.
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

  /** @type {ReturnType<typeof registry.createSession> | undefined} */
  let session;
  let sessionLanguageName = "";
  // Prefix of `code` already fed to `session`. If `code` stops starting with
  // this, treat it as a restart (new stream or language change).
  let fedCode = "";

  // Incremental line rendering via extendLines.
  let finalizedPendingHtml = "";
  /** @type {string[]} */
  let finalizedOpenScopes = [];
  let renderedCommittedCount = 0;

  // Sealed (finished, immutable) chunks of `SEAL_CHUNK_LINES` line spans
  // each, pre-joined into one HTML string apiece - `sealedChunks` is never
  // mutated in place, only appended to, and past entries are never rebuilt.
  /** @type {string[]} */
  let sealedChunks = [];
  let sealedLineCount = 0;
  // Append-only completed line HTML for the `highlight` event payload.
  // Completed lines are concatenated once as they finalize (O(n) over the
  // stream). Each repaint still assembles `highlighted = completed + preview`
  // so `on:highlight` stays live mid-line; that concat copies the completed
  // string but avoids rebuilding it from sealed DOM chunks.
  const completedHtml = createCompletedHtmlBuffer();
  // Completed lines not yet folded into a sealed chunk - bounded by
  // `SEAL_CHUNK_LINES`, so touching it every repaint stays O(1).
  /** @type {string[]} */
  let unsealedLines = [];
  // unsealedLines + the live preview line(s); rendered by the tail each-block.
  /** @type {string[]} */
  let tailLines = [];

  function ensureSession() {
    if (
      session &&
      sessionLanguageName === language.name &&
      code.startsWith(fedCode)
    ) {
      return;
    }
    ensureRegistered(language);
    session = registry.createSession(language.name);
    sessionLanguageName = language.name;
    fedCode = "";
    finalizedPendingHtml = "";
    finalizedOpenScopes = [];
    renderedCommittedCount = 0;
    sealedChunks = [];
    sealedLineCount = 0;
    completedHtml.reset();
    unsealedLines = [];
    tailLines = [];
  }

  // Folds the first SEAL_CHUNK_LINES entries of `unsealedLines` into one new
  // sealed chunk. Called in a loop, so a single repaint that completes many
  // lines at once (a burst of chunks coalesced into one frame) still seals
  // as many full chunks as are ready.
  function sealChunk() {
    const chunkLines = unsealedLines.slice(0, SEAL_CHUNK_LINES);
    let domHtml = "";
    for (let li = 0; li < chunkLines.length; li++) {
      const i = sealedLineCount + li;
      const sep = i > 0 ? "\n" : "";
      domHtml += `${sep}<span class="highlight-stream-line" data-line="${i}">${chunkLines[li]}</span>`;
    }
    sealedChunks.push(domHtml);
    sealedChunks = sealedChunks;
    sealedLineCount += chunkLines.length;
    unsealedLines = unsealedLines.slice(SEAL_CHUNK_LINES);
  }

  function repaint() {
    ensureSession();
    if (code.length > fedCode.length) {
      session.append(code.slice(fedCode.length));
      fedCode = code;
    }

    if (done) {
      // Full re-parse for multi-line lookahead (heredocs, etc.).
      highlighted = session.finish({ canonicalize: true }).value;
    } else {
      // Newly committed events (append only tokenizes complete lines).
      const committed = session.events();
      if (committed.length > renderedCommittedCount) {
        const result = extendLines(
          committed.slice(renderedCommittedCount),
          finalizedOpenScopes,
          finalizedPendingHtml,
        );
        if (result.completedLines.length > 0) {
          completedHtml.appendLines(result.completedLines);
          unsealedLines = unsealedLines.concat(result.completedLines);
          while (unsealedLines.length >= SEAL_CHUNK_LINES) sealChunk();
        }
        finalizedPendingHtml = result.pendingHtml;
        finalizedOpenScopes = result.openScopes;
        renderedCommittedCount = committed.length;
      }

      // Staged tail: current line still streaming in, not newline-terminated.
      const snapshot = session.snapshot();
      let previewLines = [finalizedPendingHtml];
      if (snapshot.pos < fedCode.length) {
        const preview = registry.resume(fedCode, sessionLanguageName, snapshot);
        const result = extendLines(
          preview.events,
          finalizedOpenScopes,
          finalizedPendingHtml,
        );
        previewLines = [...result.completedLines, result.pendingHtml];
      }

      tailLines = [...unsealedLines, ...previewLines];

      // Always assemble a live event payload (including mid-line preview).
      // Trailing empty preview keeps a final `\n` when the stream ends a line.
      const completed = completedHtml.toString();
      highlighted =
        completedHtml.lineCount === 0
          ? previewLines.join("\n")
          : `${completed}\n${previewLines.join("\n")}`;
    }

    dispatch("highlight", { highlighted });

    if (autoScroll) {
      tick().then(() => {
        if (stickToBottom) scrollToBottom();
      });
    }
  }

  function scrollToBottom() {
    if (container) container.scrollTop = container.scrollHeight;
  }

  function onScroll() {
    if (!container) return;
    const gap =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    stickToBottom = gap <= 4;
    if (virtualize) scheduleVirtualRepaint();
  }

  function cancelFrame() {
    if (frame != null) {
      cancelAnimationFrame(frame);
      frame = undefined;
    }
  }

  // Coalesce chunk bursts into one highlight pass per frame.
  function scheduleRepaint() {
    if (frame != null) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      repaint();
    });
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
  }

  // Mirrors `scrollToBottom`/the shrink-clamp in `HighlightVirtual`, merged:
  // while streaming with `autoScroll`, stick to the (growing) bottom; once
  // the user scrolls away, just keep the scroll position in bounds.
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
    );
  }

  $: {
    void code;
    void language;
    if (virtualize) {
      // Content/window updates are handled by the virtualize-specific
      // reactive blocks below; this block only tracks `done` dispatch so
      // both modes share the same guard/reset semantics.
      if (mounted && done) {
        if (!doneDispatched) {
          doneDispatched = true;
          dispatch("done");
        }
      } else {
        doneDispatched = false;
      }
    } else if (mounted && !done) {
      doneDispatched = false;
      scheduleRepaint();
    } else {
      // SSR, pre-mount, and final done pass: synchronous, no rAF.
      cancelFrame();
      repaint();
      if (mounted && !doneDispatched) {
        doneDispatched = true;
        dispatch("done");
      }
    }
  }

  // Rebuilds/updates the virtualized document whenever its content or shape
  // changes. Deliberately separate from the scroll-driven block below, same
  // reasoning as `HighlightVirtual`.
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

  // Scroll/resize/overscan/lineHeight-driven window recompute.
  $: if (virtualize && mounted) {
    void overscan;
    void vLineHeight;
    void vScrollTop;
    void vClientHeight;
    void vLineCount;
    computeVirtualWindow();
  }

  $: useSplitRendering = mounted && !done;
  $: showCaret = useSplitRendering && caret;

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
      cancelFrame();
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
    on:scroll={onScroll}
    {...$$restProps}
  ><code>{#if !mounted}{code}{:else}<span class="shl-virtual-sizer" style="height: {vLineCount * vLineHeight}px;"><span class="shl-virtual-window" style="transform: translateY({vStart * vLineHeight}px);">{#each vVisibleLines as line, i (vStart + i)}<span class="highlight-stream-line" data-line={vStart + i}>{@html line}</span>{#if showCaret && vEnd === vLineCount && i === vVisibleLines.length - 1}<span class="highlight-stream-caret" aria-hidden="true"></span>{/if}{"\n"}{/each}</span></span>{/if}</code><span
  bind:this={probe}
  class="shl-virtual-probe highlight-stream-line"
  aria-hidden="true"
>&nbsp;</span></pre>
{:else}
  <pre bind:this={container} on:scroll={onScroll} {...$$restProps}><code
  class:hljs={true}
>{#if useSplitRendering}{#each sealedChunks as chunk, c (c)}{@html chunk}{/each}{#each tailLines as line, li (sealedLineCount + li)}{#if sealedLineCount + li > 0}{"\n"}{/if}<span class="highlight-stream-line" data-line={sealedLineCount + li}>{@html line}</span>{/each}{#if showCaret}<span class="highlight-stream-caret" aria-hidden="true"></span>{/if}{:else}{@html highlighted}{/if}</code></pre>
{/if}

<style>
  .shl-virtual {
    display: block;
    position: relative;
    overflow: auto;
    white-space: pre;
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

  .highlight-stream-caret {
    display: inline-block;
    width: var(--caret-width, 0.6em);
    height: var(--caret-height, 1.1em);
    margin-left: var(--caret-gap, 1px);
    vertical-align: text-bottom;
    background: var(--caret-color, currentColor);
    animation: highlight-stream-blink var(--caret-blink, 1s) step-end infinite;
  }

  @keyframes highlight-stream-blink {
    50% {
      opacity: 0;
    }
  }
</style>
