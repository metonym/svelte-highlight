<script>
  /**
   * Highlighted HTML from `Highlight`'s `highlighted` slot.
   * @type {string}
   */
  export let highlighted = "";

  /**
   * Milliseconds between characters.
   * @type {number}
   */
  export let speed = 30;

  /**
   * Pause with `false`; resume picks up where it left off.
   * @type {boolean}
   */
  export let play = true;

  import { createEventDispatcher, onMount } from "svelte";
  import { linear } from "./typewriter-easing.js";
  import {
    buildUnitMarkup,
    createTypewriterSplitter,
    tokenizeTypewriter as tokenize,
  } from "./typewriter-units.js";

  /**
   * Reveal-progress curve: maps elapsed-time fraction (0-1) to
   * revealed-fraction (0-1). Total typing duration is always
   * `speed * <visible character count>` regardless of curve -- only the
   * pacing within that duration changes. Import a named curve
   * (`easeOutQuad`, `easeInOutCubic`, ...) or pass your own function.
   * @type {(t: number) => number}
   */
  export let easing = linear;

  const dispatch = createEventDispatcher();

  // Above this many visible units, per-unit spans (one element per char)
  // stop paying for themselves; fall back to the old whole-string rebuild.
  const UNIT_THRESHOLD = 20000;

  const EMPTY_PARTS = { head: "", tail: "" };

  /** @type {boolean} */
  let mounted = false;

  /** @type {boolean} */
  let doneFired = false;

  /** Number of visible characters currently revealed. @type {number} */
  let revealed = 0;

  /** @type {number | undefined} */
  let rafId;

  /** Active ms elapsed for the current run (excludes paused time). @type {number} */
  let elapsedMs = 0;

  /** `performance.now()` at the last tick, or `undefined` right after a (re)start. @type {number | undefined} */
  let frameTime;

  /** @type {string | undefined} */
  let prevHighlighted;

  /** Container for the per-unit spans (unit-reveal path only). @type {HTMLElement} */
  let contentEl;

  /** @type {HTMLElement[]} */
  let unitEls = [];

  /** The `units` array currently painted into `contentEl`. */
  let paintedUnits;

  /** How many leading units already had `typewriter-hidden` removed. */
  let revealedInDom = 0;

  /** The unit currently marked with the caret, if any. @type {HTMLElement | undefined} */
  let caretMark;

  /**
   * Bring `contentEl` in sync with `units`/`revealed` in O(1) amortized work:
   * a fresh `units` value triggers one full (re)paint; otherwise only the
   * units newly revealed since the last call are touched.
   */
  function syncUnitDom() {
    if (!contentEl) return;

    if (paintedUnits !== units) {
      contentEl.innerHTML = buildUnitMarkup(units);
      unitEls = Array.from(contentEl.getElementsByClassName("typewriter-unit"));
      paintedUnits = units;
      revealedInDom = 0;
      caretMark = undefined;
      // Resolve `currentColor` to a literal value now, while `contentEl`
      // itself carries the theme's base foreground (nothing has recolored
      // it yet). Stored as a custom property, it stays correct even once
      // the caret mark lands inside a colored hljs token span, where a live
      // `currentColor` would pick up that token's color instead.
      contentEl.style.setProperty(
        "--typewriter-caret-fg",
        getComputedStyle(contentEl).color,
      );
    }

    while (revealedInDom < revealed) {
      unitEls[revealedInDom]?.classList.remove("typewriter-hidden");
      revealedInDom++;
    }

    if (caretMark) {
      caretMark.classList.remove("typewriter-caret");
      caretMark = undefined;
    }
    if (revealed < total) {
      const next = unitEls[revealed];
      if (next) {
        next.classList.add("typewriter-caret");
        caretMark = next;
      }
    }
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
   * One animation frame: advance `elapsedMs` by the real time since the last
   * frame (zero on the first frame after a start/resume, so pausing never
   * counts the paused gap), then derive `revealed` from `easing` applied to
   * the elapsed fraction of the total duration. Total duration is always
   * `speed * total`, so only the pacing within it -- not its length --
   * depends on `easing`. Clamped to `[0, total]` since a custom `easing` may
   * overshoot outside `[0, 1]` (e.g. a "back"/"elastic" curve).
   * @param {number} now
   */
  function tick(now) {
    if (frameTime !== undefined) elapsedMs += now - frameTime;
    frameTime = now;

    const duration = Math.max(0, speed) * total;
    const t = duration > 0 ? Math.min(1, elapsedMs / duration) : 1;
    const target = Math.round(easing(t) * total);
    const next = Math.min(total, Math.max(0, target));
    if (next > revealed) revealed = next;

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

  /** Start/stop/retime the typing loop. */
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
  // `splitter` must be rebuilt whenever `units` does, from the same
  // `highlighted` string `units` was tokenized from -- both are recomputed
  // together in the same reactive flush whenever `highlighted` changes.
  $: splitter = createTypewriterSplitter(units, highlighted);
  $: total = units.reduce((sum, unit) => sum + unit.visible, 0);
  $: bigInput = total > UNIT_THRESHOLD;
  $: useUnitReveal = mounted && !bigInput;

  // Restart when `highlighted` changes.
  $: if (highlighted !== prevHighlighted) {
    prevHighlighted = highlighted;
    doneFired = false;
    elapsedMs = 0;
    revealed = 0;
    void useUnitReveal;
    sync();
  }

  // Re-sync on play/speed/easing/mount. Skip `total` (handled above).
  $: {
    void [play, speed, easing, mounted, useUnitReveal];
    sync();
  }

  // SSR / slow-path: full content up front, splitter only when actually needed.
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

  /* `.typewriter-unit`/`.typewriter-hidden` only ever exist inside the
       `{@html}`-free, JS-painted `contentEl`, so they're invisible to Svelte's
       static analysis and must stay unscoped. */
  :global(.typewriter-unit.typewriter-hidden) {
    visibility: hidden;
  }

  /* The caret rides the next-to-reveal (still hidden) unit's ::before, so it
       never requires moving a real DOM node -- one class add/remove per tick.
       That unit can land inside a still-open hljs token span (e.g. mid-
       keyword), where `currentColor` would resolve to that token's color
       instead of the theme's base foreground. `--typewriter-caret-fg` is set
       on `contentEl` as a literal resolved color (not the `currentColor`
       keyword) in `syncUnitDom`, so it survives that nesting unaffected by
       descendant `color` overrides. */
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
