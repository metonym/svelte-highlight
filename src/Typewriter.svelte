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
  import { tokenizeTypewriter as tokenize } from "./typewriter-units.js";

  const dispatch = createEventDispatcher();

  // Above this many visible units, per-unit spans (one element per char)
  // stop paying for themselves; fall back to the old whole-string rebuild.
  const UNIT_THRESHOLD = 20000;

  const EMPTY_PARTS = { head: "", tail: "" };

  /** @type {boolean} */
  let mounted = false;

  /** @type {boolean} */
  let reducedMotion = false;

  /** @type {boolean} */
  let doneFired = false;

  /** Number of visible characters currently revealed. @type {number} */
  let revealed = 0;

  /** @type {ReturnType<typeof setInterval> | undefined} */
  let timerId;

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
   * Split at `count` visible chars. Close open tags in `head`, reopen in `tail`.
   * Hidden `tail` reserves space so layout doesn't jump.
   */
  function split(list, count) {
    let head = "";
    let shown = 0;
    /** @type {{ raw: string; name: string }[]} */
    const open = [];
    let i = 0;

    for (; i < list.length; i++) {
      const unit = list[i];
      if (shown >= count) break;
      head += unit.raw;
      if (unit.visible === 0) {
        if (unit.kind === "open")
          open.push({ raw: unit.raw, name: unit.name ?? "" });
        else if (unit.kind === "close") open.pop();
      } else {
        shown += unit.visible;
      }
    }

    // Close open tags in head, reopen them at the start of tail.
    let headClose = "";
    for (let k = open.length - 1; k >= 0; k--)
      headClose += `</${open[k].name}>`;

    let tail = "";
    for (const tag of open) tail += tag.raw;
    for (; i < list.length; i++) tail += list[i].raw;

    return { head: head + headClose, tail };
  }

  /** Render every unit once: tags pass through, each visible unit gets a span. */
  function buildUnitMarkup(list) {
    let html = "";
    for (const unit of list) {
      html +=
        unit.visible === 0
          ? unit.raw
          : `<span class="typewriter-unit typewriter-hidden">${unit.raw}</span>`;
    }
    return html;
  }

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

  function clearTimer() {
    clearInterval(timerId);
    timerId = undefined;
  }

  function fireDone() {
    if (!doneFired && total > 0 && revealed >= total) {
      doneFired = true;
      dispatch("done");
    }
  }

  function advance() {
    if (revealed < total) revealed += 1;
    if (useUnitReveal) syncUnitDom();
    if (revealed >= total) {
      clearTimer();
      fireDone();
    }
  }

  /** Start/stop/retime the typing interval. */
  function sync() {
    clearTimer();
    if (!mounted) return;

    if (reducedMotion) {
      // Reduced motion: show all at once.
      if (revealed !== total) revealed = total;
      fireDone();
      return;
    }

    if (useUnitReveal) syncUnitDom();

    if (play && revealed < total) {
      timerId = setInterval(advance, Math.max(0, speed));
    } else if (revealed >= total) {
      fireDone();
    }
  }

  $: units = tokenize(highlighted);
  $: total = units.reduce((sum, unit) => sum + unit.visible, 0);
  $: bigInput = total > UNIT_THRESHOLD;
  $: useUnitReveal = mounted && !reducedMotion && !bigInput;

  // Restart when `highlighted` changes.
  $: if (highlighted !== prevHighlighted) {
    prevHighlighted = highlighted;
    doneFired = false;
    revealed = reducedMotion ? total : 0;
    void useUnitReveal;
    sync();
  }

  // Re-sync on play/speed/mount/motion. Skip `total` (handled above).
  $: {
    void [play, speed, mounted, reducedMotion, useUnitReveal];
    sync();
  }

  // SSR / slow-path: full content up front, split() only when actually needed.
  $: parts = useUnitReveal
    ? EMPTY_PARTS
    : mounted
      ? split(units, revealed)
      : { head: highlighted, tail: "" };
  $: showCaret = mounted && !reducedMotion && revealed < total;

  onMount(() => {
    mounted = true;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion = query.matches;
    const onChange = (event) => {
      reducedMotion = event.matches;
    };
    query.addEventListener?.("change", onChange);

    return () => {
      query.removeEventListener?.("change", onChange);
      clearTimer();
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
       never requires moving a real DOM node -- one class add/remove per tick. */
  :global(.typewriter-unit.typewriter-caret)::before {
    content: "";
    visibility: visible;
    display: inline-block;
    width: var(--caret-width, 0.6em);
    height: var(--caret-height, 1.1em);
    margin-left: var(--caret-gap, 1px);
    vertical-align: text-bottom;
    background: var(--caret-color, currentColor);
    animation: typewriter-blink var(--caret-blink, 1s) step-end infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .typewriter-caret,
    :global(.typewriter-unit.typewriter-caret)::before {
      animation: none;
    }
  }

  @keyframes typewriter-blink {
    50% {
      opacity: 0;
    }
  }
</style>
