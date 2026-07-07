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

  import hljs from "highlight.js/lib/core";
  import { createEventDispatcher, onMount, tick } from "svelte";
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

  function repaint() {
    hljs.registerLanguage(language.name, language.register);
    highlighted = hljs.highlight(code, { language: language.name }).value;
    lines = splitLines(highlighted);
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

  // Coalesce a burst of chunks within one frame into a single highlight
  // pass; the tab going hidden just pauses the (already-scheduled) frame
  // rather than queuing more work.
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
      // SSR / first paint before mount, and the final full highlight once
      // the stream finishes: both render synchronously, no rAF involved.
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
