<script>
  /**
   * Highlighted HTML from `Highlight`'s `highlighted` slot prop.
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

  const dispatch = createEventDispatcher();

  /** Captures the tag name from an opening or closing tag. */
  const TAG_NAME = /^<\/?\s*([a-zA-Z0-9-]+)/;

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

  /**
   * Split highlighted HTML into renderable units. Tag units carry no visible
   * weight; each text character or HTML entity counts as a single visible unit
   * so typing advances one visible character at a time without splitting markup.
   * @param {string} html
   */
  function tokenize(html) {
    /** @type {{ raw: string; visible: number; kind?: string; name?: string }[]} */
    const units = [];
    const n = html.length;
    let i = 0;

    while (i < n) {
      const ch = html[i];

      if (ch === "<") {
        const end = html.indexOf(">", i);
        if (end === -1) {
          // Malformed tail. Treat as plain text.
          units.push({ raw: html.slice(i), visible: 1 });
          break;
        }
        const raw = html.slice(i, end + 1);
        const kind =
          raw[1] === "/"
            ? "close"
            : raw[raw.length - 2] === "/"
              ? "self"
              : "open";
        const match = TAG_NAME.exec(raw);
        units.push({ raw, visible: 0, kind, name: match ? match[1] : "" });
        i = end + 1;
      } else if (ch === "&") {
        // Treat an entity (e.g. `&lt;`) as one visible character.
        const end = html.indexOf(";", i);
        if (end !== -1 && end - i <= 10) {
          units.push({ raw: html.slice(i, end + 1), visible: 1 });
          i = end + 1;
        } else {
          units.push({ raw: ch, visible: 1 });
          i += 1;
        }
      } else {
        units.push({ raw: ch, visible: 1 });
        i += 1;
      }
    }

    return units;
  }

  /**
   * Split at the first `count` visible characters. `head` is what's shown;
   * `tail` is the rest. Open tags at the cut get closed in `head` and reopened
   * in `tail`. `tail` renders hidden but still takes up space, so layout
   * doesn't shift as characters appear.
   * @param {ReturnType<typeof tokenize>} list
   * @param {number} count
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

    // Close the still-open tags so `head` is well-formed...
    let headClose = "";
    for (let k = open.length - 1; k >= 0; k--)
      headClose += `</${open[k].name}>`;

    // ...and reopen the same tags at the start of `tail` so it is too.
    let tail = "";
    for (const tag of open) tail += tag.raw;
    for (; i < list.length; i++) tail += list[i].raw;

    return { head: head + headClose, tail };
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

  function tick() {
    if (revealed < total) revealed += 1;
    if (revealed >= total) {
      clearTimer();
      fireDone();
    }
  }

  /** Start, stop, or retime the typing interval from current inputs. */
  function sync() {
    clearTimer();
    if (!mounted) return;

    if (reducedMotion) {
      // With reduced motion, show everything at once.
      if (revealed !== total) revealed = total;
      fireDone();
      return;
    }

    if (play && revealed < total) {
      timerId = setInterval(tick, Math.max(0, speed));
    } else if (revealed >= total) {
      fireDone();
    }
  }

  $: units = tokenize(highlighted);
  $: total = units.reduce((sum, unit) => sum + unit.visible, 0);

  // Restart typing when the source content changes.
  $: if (highlighted !== prevHighlighted) {
    prevHighlighted = highlighted;
    doneFired = false;
    revealed = reducedMotion ? total : 0;
    sync();
  }

  // Reconfigure (but never restart per-tick) when playback inputs change.
  // The array makes the dependencies explicit without the comma operator.
  $: {
    void [play, speed, mounted, reducedMotion, total];
    sync();
  }

  // Before mount (incl. SSR) render the full content so it is visible without
  // JS; once mounted, type out character by character from `revealed`.
  $: parts = mounted ? split(units, revealed) : { head: highlighted, tail: "" };
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

<pre
  {...$$restProps}
><code class:hljs={true}>{@html parts.head}{#if showCaret}<span
      class="typewriter-caret"
      aria-hidden="true"
    ></span>{/if}<span class="typewriter-rest" aria-hidden="true"
    >{@html parts.tail}</span></code></pre>

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

  @media (prefers-reduced-motion: reduce) {
    .typewriter-caret {
      animation: none;
    }
  }

  @keyframes typewriter-blink {
    50% {
      opacity: 0;
    }
  }
</style>
