<script>
  /** @type {string | undefined} */
  export let highlighted = undefined;

  /** @type {string[] | undefined} */
  export let lines = undefined;

  /** @type {number | undefined} */
  export let lineCount = undefined;

  /** @type {boolean} */
  export let hideBorder = false;

  /** @type {boolean} */
  export let wrapLines = false;

  /** @type {number} */
  export let startingLineNumber = 1;

  /** @type {number[]} */
  export let highlightedLines = [];

  /** @type {Record<number, "highlighted" | "focus" | "added" | "removed">} */
  export let lineStates = {};

  /** @type {import('./languages').LanguageName | (string & {})} */
  export let languageName = "plaintext";

  /** @type {boolean} */
  export let langtag = false;

  /**
   * Accessible name of the scrollable code region. Inside a CodeWindow, the
   * window's `title` or `label` is the default.
   * @type {string | undefined}
   */
  export let label = undefined;

  import { getContext } from "svelte";
  import { CODE_REGION, NO_REGION_LABEL } from "./code-region.js";
  import { splitLines } from "./split-lines.js";

  /** @type {import("svelte/store").Readable<string | undefined>} */
  const windowLabel = getContext(CODE_REGION) ?? NO_REGION_LABEL;

  const MIN_DIGITS = 2;
  const HIGHLIGHTED_BACKGROUND = "rgba(254, 241, 96, 0.2)";
  const ADDED_BACKGROUND = "rgba(46, 204, 113, 0.15)";
  const REMOVED_BACKGROUND = "rgba(231, 76, 60, 0.15)";

  /**
   * @param {number[]} highlightedLines
   * @param {Record<number, "highlighted" | "focus" | "added" | "removed">} lineStates
   */
  function buildStateByIndex(highlightedLines, lineStates) {
    const map = new Map(highlightedLines.map((i) => [i, "highlighted"]));
    for (const key in lineStates) map.set(Number(key), lineStates[key]);
    return map;
  }

  /** @param {"highlighted" | "focus" | "added" | "removed" | undefined} state */
  function lineBackground(state) {
    if (state === "added") {
      return `var(--line-added-background, ${ADDED_BACKGROUND})`;
    }
    if (state === "removed") {
      return `var(--line-removed-background, ${REMOVED_BACKGROUND})`;
    }
    if (state === "highlighted") {
      return `var(--highlighted-background, ${HIGHLIGHTED_BACKGROUND})`;
    }
    return undefined;
  }

  $: renderedLines = lines ?? splitLines(highlighted ?? "");
  $: stateByIndex = buildStateByIndex(highlightedLines, lineStates);
  $: focusMode = stateByIndex.size > 0;
  $: len_digits = (
    startingLineNumber +
    (lineCount ?? renderedLines.length) -
    1
  ).toString().length;
  $: len = len_digits - MIN_DIGITS < 1 ? MIN_DIGITS : len_digits;
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
  class:langtag
  data-language={languageName}
  style:overflow-x="var(--overflow-x, auto)"
  style:overflow-y="var(--overflow-y, auto)"
  style:border-radius="var(--border-radius, 0)"
  style:width="var(--width, auto)"
  style:max-width="var(--max-width, none)"
  tabindex="0"
  role="region"
  aria-label={label ?? $windowLabel ?? "Code with line numbers"}
  {...$$restProps}
>
  <table role="presentation">
    <tbody class:hljs={true}>
      {#each renderedLines as line, i}
        {@const lineNumber = i + startingLineNumber}
        {@const lineState = stateByIndex.get(i)}
        {@const background = lineBackground(lineState)}
        <tr class:dimmed={focusMode && !lineState}>
          <td
            aria-hidden="true"
            class:hljs={true}
            class:hideBorder
            style:position="sticky"
            style:inset-inline-start="0"
            style:text-align="end"
            style:user-select="none"
            style:width={`calc(${len} * var(--line-number-digit-width, 0.6em))`}
          >
            <code style:color="var(--line-number-color, currentColor)">
              {lineNumber}
            </code>
            {#if background}
              <div class:line-background={true} style:background></div>
            {/if}
          </td>
          <td>
            <pre class:wrapLines><code>{@html line || "\n"}</code></pre>
            {#if background}
              <div class:line-background={true} style:background></div>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  /* Inline, not imported: injected CSS keeps a relative import as written,
     and the browser resolves it against the page URL (#663). */
  .langtag {
    position: relative;
  }

  .langtag::after {
    content: attr(data-language);
    position: absolute;
    top: var(--langtag-top, 0);
    right: var(--langtag-right, 0);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--langtag-background, inherit);
    color: var(--langtag-color, inherit);
    border-radius: var(--langtag-border-radius, 0);
    padding: var(--langtag-padding, 1em);
    font-size: var(--langtag-font-size, inherit);
  }

  pre {
    margin: 0;
    direction: ltr;
  }

  /* Draw the ring inside, or a clipping parent hides it in Safari. */
  div:focus-visible {
    outline-offset: -2px;
  }

  table,
  tr,
  td {
    padding: 0;
    border: 0;
    margin: 0;
    vertical-align: baseline;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
  }

  td {
    padding-left: var(--padding-left, var(--padding, 1em));
    padding-right: var(--padding-right, var(--padding, 1em));
  }

  td,
  td > code,
  pre {
    position: relative;
  }

  tr:first-of-type td {
    padding-top: 1em;
  }

  tr:last-child td {
    padding-bottom: 1em;
  }

  tr td:first-of-type {
    z-index: 2;
  }

  td.hljs:not(.hideBorder):after {
    content: "";
    position: absolute;
    top: 0;
    inset-inline-end: 0;
    width: 1px;
    height: 100%;
    background: var(--border-color, currentColor);
  }

  .wrapLines {
    white-space: pre-wrap;
  }

  td > code,
  pre {
    z-index: 1;
  }

  .line-background {
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  tr:first-of-type td .line-background,
  tr:last-of-type td .line-background {
    height: calc(100% - 1em);
  }

  tr:first-of-type td .line-background {
    top: 1em;
  }

  tr:last-of-type td .line-background {
    bottom: 1em;
  }

  tr.dimmed td > code,
  tr.dimmed pre {
    opacity: var(--unhighlighted-opacity, 1);
    filter: var(--unhighlighted-filter, none);
  }
</style>
