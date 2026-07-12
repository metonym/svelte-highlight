<script>
  /**
   * Code to render. A 100k-line document costs ~`overscan`*2 + viewport
   * line nodes, not one per line.
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
   * Lines between engine checkpoints (forwarded to `createTokenizedDocument`).
   * @type {number}
   */
  export let checkpointInterval = 100;

  import { onMount, tick } from "svelte";
  import { createTokenizedDocument } from "./tokenized-document.js";

  /** @type {HTMLElement} */
  let container;

  /** @type {HTMLElement} */
  let probe;

  // Uniform line height (v1 constraint), measured once from a rendered
  // probe line and re-measured when webfonts finish loading.
  let lineHeight = 16;

  // Gates the SSR/pre-mount plain-text branch vs. the windowed view: the
  // client's first render must match the server's markup byte-for-byte, so
  // this only flips true inside onMount, after hydration has attached.
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
    const first = Math.max(0, Math.floor(scrollTop / lineHeight) - overscan);
    const last = Math.min(
      total,
      Math.ceil((scrollTop + clientHeight) / lineHeight) + overscan,
    );
    start = Math.min(first, total);
    end = Math.max(start, last);
    visibleLines = doc.lineRange(start, end);
  }

  // After the document changes shape, the sizer's height changes too; sync
  // our tracked scrollTop/clientHeight from the (now-updated) DOM so an
  // out-of-range scroll position - the document shrank while scrolled near
  // its old end - is clamped rather than left pointing past the new content.
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

  async function measureLineHeight() {
    await tick();
    if (probe) {
      const height = probe.getBoundingClientRect().height;
      if (height > 0) lineHeight = height;
    }
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(async () => {
        await tick();
        if (!probe) return;
        const height = probe.getBoundingClientRect().height;
        if (height > 0 && height !== lineHeight) lineHeight = height;
      });
    }
  }

  // Rebuilds/updates the document whenever its content or shape changes.
  // Deliberately separate from the scroll-driven block below so scrolling
  // never touches doc.setCode() (O(len) prefix check) on every frame.
  $: if (hydrated) {
    void source;
    void language;
    void checkpointInterval;
    ensureDoc();
    doc.setCode(source);
    lineCount = doc.lineCount();
    computeWindow();
    syncFromContainer();
  }

  // Scroll/resize/overscan/lineHeight-driven window recompute.
  $: if (hydrated) {
    void overscan;
    void lineHeight;
    void scrollTop;
    void clientHeight;
    void lineCount;
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

  .shl-virtual-line {
    display: inline;
  }

  .shl-virtual-probe {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
  }
</style>
