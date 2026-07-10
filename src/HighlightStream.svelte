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
  import { splitLines } from "./split-lines.js";

  const dispatch = createEventDispatcher();

  /** @type {HTMLElement} */
  let container;

  /** @type {string} */
  let highlighted = "";

  /** @type {string[]} */
  let lines = [];

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

  // Incremental line rendering via extendLines. finalizedLines is append-only;
  // the keyed each-block below does not touch completed lines on repaint.
  /** @type {string[]} */
  let finalizedLines = [];
  let finalizedPendingHtml = "";
  /** @type {string[]} */
  let finalizedOpenScopes = [];
  let renderedCommittedCount = 0;

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
    finalizedLines = [];
    finalizedPendingHtml = "";
    finalizedOpenScopes = [];
    renderedCommittedCount = 0;
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
      lines = splitLines(highlighted);
    } else {
      // Newly committed events (append only tokenizes complete lines).
      const committed = session.events();
      if (committed.length > renderedCommittedCount) {
        const result = extendLines(
          committed.slice(renderedCommittedCount),
          finalizedOpenScopes,
          finalizedPendingHtml,
        );
        finalizedLines = [...finalizedLines, ...result.completedLines];
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

      lines = [...finalizedLines, ...previewLines];
      highlighted = lines.join("\n");
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
>{#if useSplitRendering}{#each lines as line, i (i)}{#if i > 0}{"\n"}{/if}<span class="highlight-stream-line" data-line={i}>{@html line}</span>{/each}{#if showCaret}<span class="highlight-stream-caret" aria-hidden="true"></span>{/if}{:else}{@html highlighted}{/if}</code></pre>

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
