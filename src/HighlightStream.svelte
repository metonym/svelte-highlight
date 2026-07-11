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

  import { createEventDispatcher, onMount, tick } from "svelte";
  import { extendLines } from "./engine.js";
  import { ensureRegistered, registry } from "./registry.js";

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
  // `sealedHtml` mirrors the same sealed prefix as plain (wrapper-free) HTML,
  // appended once per sealed chunk, so `highlighted` below is O(tail) per
  // repaint instead of rejoining every line streamed so far.
  /** @type {string[]} */
  let sealedChunks = [];
  let sealedHtml = "";
  let sealedLineCount = 0;
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
    sealedHtml = "";
    sealedLineCount = 0;
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
    let plainHtml = "";
    for (let li = 0; li < chunkLines.length; li++) {
      const i = sealedLineCount + li;
      const sep = i > 0 ? "\n" : "";
      domHtml += `${sep}<span class="highlight-stream-line" data-line="${i}">${chunkLines[li]}</span>`;
      plainHtml += sep + chunkLines[li];
    }
    sealedChunks = [...sealedChunks, domHtml];
    sealedHtml += plainHtml;
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
      highlighted =
        sealedHtml + (sealedLineCount > 0 ? "\n" : "") + tailLines.join("\n");
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

  $: {
    void code;
    void language;
    if (mounted && !done) {
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

  $: useSplitRendering = mounted && !done;
  $: showCaret = useSplitRendering && caret;

  onMount(() => {
    mounted = true;
    return cancelFrame;
  });
</script>

<pre bind:this={container} on:scroll={onScroll} {...$$restProps}><code
  class:hljs={true}
>{#if useSplitRendering}{#each sealedChunks as chunk, c (c)}{@html chunk}{/each}{#each tailLines as line, li (sealedLineCount + li)}{#if sealedLineCount + li > 0}{"\n"}{/if}<span class="highlight-stream-line" data-line={sealedLineCount + li}>{@html line}</span>{/each}{#if showCaret}<span class="highlight-stream-caret" aria-hidden="true"></span>{/if}{:else}{@html highlighted}{/if}</code></pre>

<style>
  .highlight-stream-caret {
    display: inline-block;
    width: var(--caret-width, 0.6em);
    height: var(--caret-height, 1.1em);
    margin-left: var(--caret-gap, 1px);
    vertical-align: text-bottom;
    background: var(--caret-color, currentColor);
    animation: highlight-stream-blink var(--caret-blink, 1s) step-end infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .highlight-stream-caret {
      animation: none;
    }
  }

  @keyframes highlight-stream-blink {
    50% {
      opacity: 0;
    }
  }
</style>
