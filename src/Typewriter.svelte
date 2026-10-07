<script>
  /** @type {string} */
  export let highlighted = "";

  /** @type {number} */
  export let speed = 30;

  /** @type {boolean} */
  export let play = true;

  import { createEventDispatcher, onMount } from "svelte";
  import { linear } from "./typewriter-easing.js";
  import {
    buildUnitMarkup,
    computeWordBoundaries,
    createTypewriterSplitter,
    tokenizeTypewriter as tokenize,
  } from "./typewriter-units.js";

  /** @type {(t: number) => number} */
  export let easing = linear;

  /** @type {"char" | "word"} */
  export let granularity = "char";

  const dispatch = createEventDispatcher();

  // Above this many units, per-char spans cost more than whole-string rebuilds.
  const UNIT_THRESHOLD = 20000;

  const EMPTY_PARTS = { head: "", tail: "" };

  /** @type {boolean} */
  let mounted = false;

  /** @type {boolean} */
  let doneFired = false;

  /** Exported only for `bind:revealed`; overwritten every frame. @type {number} */
  export let revealed = 0;

  /** Exported only for `bind:total`; derived from `units`. @type {number} */
  export let total = 0;

  /** @type {number | undefined} */
  let rafId;

  /** Excludes paused time. @type {number} */
  let elapsedMs = 0;

  /** `undefined` right after a (re)start. @type {number | undefined} */
  let frameTime;

  /** @type {string | undefined} */
  let prevHighlighted;

  /** @type {HTMLElement} */
  let contentEl;

  /** @type {HTMLElement[]} */
  let unitEls = [];

  let paintedUnits;

  let revealedInDom = 0;

  /** @type {HTMLElement | undefined} */
  let caretMark;

  /** Full repaint only when `units` changes; otherwise reveals new units only. */
  function syncUnitDom() {
    if (!contentEl) return;

    if (paintedUnits !== units) {
      contentEl.innerHTML = buildUnitMarkup(units);
      unitEls = Array.from(contentEl.getElementsByClassName("typewriter-unit"));
      paintedUnits = units;
      revealedInDom = 0;
      caretMark = undefined;
      // Resolve to a literal so the caret inside a colored token span keeps
      // the base foreground (a live `currentColor` would inherit the token's).
      contentEl.style.setProperty(
        "--typewriter-caret-fg",
        getComputedStyle(contentEl).color,
      );
    }

    while (revealedInDom < revealed) {
      unitEls[revealedInDom]?.classList.remove("typewriter-hidden");
      revealedInDom++;
    }

    const next = revealed < total ? unitEls[revealed] : undefined;
    if (next !== caretMark) {
      caretMark?.classList.remove("typewriter-caret");
      next?.classList.add("typewriter-caret");
      caretMark = next;
    }
  }

  /**
   * Largest value in sorted `boundaries` that is `<= target`, or `0`.
   * @param {number} target
   * @param {number[]} boundaries
   * @returns {number}
   */
  function snapToWordBoundary(target, boundaries) {
    let lo = 0;
    let hi = boundaries.length - 1;
    let result = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const value = /** @type {number} */ (boundaries[mid]);
      if (value <= target) {
        result = value;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return result;
  }

  function stopLoop() {
    if (rafId !== undefined) cancelAnimationFrame(rafId);
    rafId = undefined;
  }

  function fireDone() {
    if (!doneFired && total > 0 && revealed >= total) {
      doneFired = true;
      dispatch("done");
    }
  }

  /**
   * Clamped to `[0, total]` since a custom `easing` may overshoot `[0, 1]`.
   * @param {number} now
   */
  function tick(now) {
    if (frameTime !== undefined) elapsedMs += now - frameTime;
    frameTime = now;

    const duration = Math.max(0, speed) * total;
    const t = duration > 0 ? Math.min(1, elapsedMs / duration) : 1;
    let target = Math.round(easing(t) * total);
    if (granularity === "word" && wordBoundaries)
      target = snapToWordBoundary(target, wordBoundaries);
    const next = Math.min(total, Math.max(0, target));
    if (next > revealed) {
      revealed = next;
      dispatch("progress", { revealed, total });
    }

    if (useUnitReveal) syncUnitDom();

    if (revealed >= total) {
      stopLoop();
      fireDone();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    frameTime = undefined;
    rafId = requestAnimationFrame(tick);
  }

  function sync() {
    stopLoop();
    if (!mounted) return;

    if (useUnitReveal) syncUnitDom();

    if (play && revealed < total) {
      startLoop();
    } else if (revealed >= total) {
      fireDone();
    }
  }

  $: units = tokenize(highlighted);
  $: splitter = createTypewriterSplitter(units, highlighted);
  $: total = units.reduce((sum, unit) => sum + unit.visible, 0);
  $: wordBoundaries =
    granularity === "word" ? computeWordBoundaries(units) : null;
  $: bigInput = total > UNIT_THRESHOLD;
  $: useUnitReveal = mounted && !bigInput;

  // Restart when `highlighted` changes; `void useUnitReveal` orders this after it.
  $: if (highlighted !== prevHighlighted) {
    prevHighlighted = highlighted;
    doneFired = false;
    elapsedMs = 0;
    revealed = 0;
    void useUnitReveal;
    sync();
  }

  $: {
    void [play, speed, easing, mounted, useUnitReveal];
    sync();
  }

  // SSR: full content up front.
  $: parts = useUnitReveal
    ? EMPTY_PARTS
    : mounted
      ? splitter.splitAt(revealed)
      : { head: highlighted, tail: "" };
  $: showCaret = mounted && revealed < total;

  onMount(() => {
    mounted = true;

    return () => {
      stopLoop();
    };
  });
</script>

<pre {...$$restProps}><code class:hljs={true}
  ><span class="typewriter-content" bind:this={contentEl} hidden={!useUnitReveal}
    ></span
  >{#if !useUnitReveal}{@html parts.head}{#if showCaret}<span
        class="typewriter-caret"
        aria-hidden="true"
      ></span>{/if}<span class="typewriter-rest" aria-hidden="true"
      >{@html parts.tail}</span
    >{/if}</code></pre>

<style>
  .typewriter-rest {
    visibility: hidden;
  }

  .typewriter-caret {
    display: inline-block;
    width: var(--caret-width, 0.6em);
    height: var(--caret-height, 1.1em);
    margin-left: var(--caret-gap, 1px);
    vertical-align: text-bottom;
    background: var(--caret-color, currentColor);
    animation: typewriter-blink var(--caret-blink, 1s) step-end infinite;
  }

  /* JS-painted into `contentEl`, so must stay unscoped. */
  :global(.typewriter-unit.typewriter-hidden) {
    visibility: hidden;
  }

  /* Caret rides the next hidden unit's ::before, so no DOM node moves. */
  :global(.typewriter-unit.typewriter-caret)::before {
    content: "";
    visibility: visible;
    display: inline-block;
    width: var(--caret-width, 0.6em);
    height: var(--caret-height, 1.1em);
    margin-left: var(--caret-gap, 1px);
    vertical-align: text-bottom;
    background: var(--caret-color, var(--typewriter-caret-fg, currentColor));
    animation: typewriter-blink var(--caret-blink, 1s) step-end infinite;
  }

  @keyframes typewriter-blink {
    50% {
      opacity: 0;
    }
  }
</style>
