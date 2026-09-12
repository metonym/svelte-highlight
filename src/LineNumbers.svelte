<script>
  import { splitLines } from "./split-lines.js";

  /**
   * Highlighted `code` HTML. Required at runtime unless `lines` is passed.
   * @type {string | undefined}
   */
  export let highlighted = undefined;

  /**
   * Pre-split per-line HTML, the same shape `splitLines`/`extendLines`/
   * `TokenizedDocument#lineRange` produce. Overrides `highlighted` --
   * pass this to render a window of a larger document without re-splitting
   * the full string on every update.
   * @type {string[] | undefined}
   */
  export let lines = undefined;

  /**
   * Total document line count, for gutter-width purposes, when `lines` is a
   * partial window rather than the whole document.
   * @type {number | undefined}
   */
  export let lineCount = undefined;

  /** @type {boolean} */
  export let hideBorder = false;

  /** @type {boolean} */
  export let wrapLines = false;

  /** @type {number} */
  export let startingLineNumber = 1;

  /** @type {number[]} */
  export let highlightedLines = [];

  /**
   * Per-line decoration state, indexed relative to `lines`/`highlighted`
   * (not the absolute document line when rendering a window). Merged with
   * `highlightedLines`, which is equivalent to setting `"highlighted"` here.
   * @type {Record<number, "highlighted" | "focus" | "added" | "removed">}
   */
  export let lineStates = {};

  /**
   * Per-row primary gutter number, indexed like `lines`. Overrides
   * `i + startingLineNumber`; `null` renders a blank cell for that row
   * (e.g. an added line has no old-file number). A unified diff needs this
   * because hunks start at arbitrary offsets and no single formula produces
   * the right number for every row.
   * @type {(number | null)[] | undefined}
   */
  export let numbers = undefined;

  /**
   * Per-row secondary gutter number, indexed like `lines`. When set, renders
   * an extra gutter column to the left of the primary one (order: secondary,
   * primary, code) and becomes the sticky `inset-inline-start: 0` column
   * instead of the primary gutter. `null` renders a blank cell, same as
   * `numbers`.
   * @type {(number | null)[] | undefined}
   */
  export let secondaryNumbers = undefined;

  /** @type {import('./languages').LanguageName | (string & {})} */
  export let languageName = "plaintext";

  /** @type {boolean} */
  export let langtag = false;

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

  /** @param {(number | null)[] | undefined} values */
  function maxDigits(values) {
    let max = 0;
    for (const value of values ?? []) {
      if (value == null) continue;
      const len = value.toString().length;
      if (len > max) max = len;
    }
    return max;
  }

  $: renderedLines = lines ?? splitLines(highlighted ?? "");
  $: stateByIndex = buildStateByIndex(highlightedLines, lineStates);
  $: focusMode = stateByIndex.size > 0;
  $: defaultDigits = (
    startingLineNumber +
    (lineCount ?? renderedLines.length) -
    1
  ).toString().length;
  $: primaryDigits = numbers ? maxDigits(numbers) : defaultDigits;
  $: len = primaryDigits - MIN_DIGITS < 1 ? MIN_DIGITS : primaryDigits;
  $: secondaryDigits = maxDigits(secondaryNumbers);
  $: secondaryLen =
    secondaryDigits - MIN_DIGITS < 1 ? MIN_DIGITS : secondaryDigits;
</script>

<div
  class:langtag={langtag}
  data-language={languageName}
  style:overflow-x="var(--overflow-x, auto)"
  style:overflow-y="var(--overflow-y, auto)"
  style:border-radius="var(--border-radius, 0)"
  style:width="var(--width, auto)"
  style:max-width="var(--max-width, none)"
  {...$$restProps}
>
  <table>
    <tbody class:hljs={true}>
      {#each renderedLines as line, i}
        {@const lineNumber = numbers ? numbers[i] : i + startingLineNumber}
        {@const secondaryLineNumber = secondaryNumbers?.[i]}
        {@const lineState = stateByIndex.get(i)}
        {@const background = lineBackground(lineState)}
        <tr class:dimmed={focusMode && !lineState}>
          {#if secondaryNumbers}
            <td
              aria-hidden="true"
              class:hljs={true}
              class:hideBorder
              style:position="sticky"
              style:inset-inline-start="0"
              style:text-align="end"
              style:user-select="none"
              style:width={`calc(${secondaryLen} * var(--line-number-digit-width, 0.6em))`}
            >
              <code style:color="var(--line-number-color, currentColor)">
                {secondaryLineNumber ?? ""}
              </code>
              {#if background}
                <div class:line-background={true} style:background></div>
              {/if}
            </td>
          {/if}
          <td
            aria-hidden="true"
            class:hljs={true}
            class:hideBorder
            style:position={secondaryNumbers ? undefined : "sticky"}
            style:inset-inline-start={secondaryNumbers ? undefined : "0"}
            style:text-align="end"
            style:user-select="none"
            style:width={`calc(${len} * var(--line-number-digit-width, 0.6em))`}
          >
            <code style:color="var(--line-number-color, currentColor)">
              {lineNumber ?? ""}
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
  @import "./langtag.css";

  pre {
    margin: 0;
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
