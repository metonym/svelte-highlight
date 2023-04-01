<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    /**
     * Pass the highlighted `code` to `LineNumbers`.
     * @example
     * <Highlight language={typescript} {code} let:highlighted>
     *  <LineNumbers {highlighted} />
     * </Highlight>
     */
    highlighted: string;

    /**
     * Set to `true` to hide the border of the line numbers column.
     * @default false
     */
    hideBorder?: boolean;

    /**
     * Specify which starting line number should be displayed.
     * @default 1
     */
    startingLineNumber?: number;

    /**
     * Set to `true` for lines to wrap.
     * @default false
     */
    wrapLines?: boolean;

    /**
     * Specify the line indices to highlight.
     * @default []
     * @example [0, 1, 9]
     */
    highlightedLines?: number[];

    /**
     * Specify the text color for line numbers.
     * Defaults to the current theme color applied to `.hljs code`.
     * @default currentColor
     * @example "pink"
     */
    "--line-number-color"?: string;

    /**
     * Specify the border color.
     * Defaults to the current background color applied to `.hljs`.
     * @default currentColor
     * @example "#fff"
     */
    "--border-color"?: string;

    /**
     * Specify the left padding for `td` elements.
     * @default 1em
     * @example 0
     */
    "--padding-left"?: number | string;

    /**
     * Specify the right padding for `td` elements.
     * @default 1em
     * @example 0
     */
    "--padding-right"?: number | string;

    /**
     * Specify the background color of highlighted lines.
     * @default "rgba(254, 241, 96, 0.2)"
     * @example "#fff"
     */
    "--highlighted-background"?: string;
  }

  export let highlighted: $$Props["highlighted"];

  export let hideBorder = false;

  export let wrapLines = false;

  export let startingLineNumber = 1;

  export let highlightedLines = [];

  const DIGIT_WIDTH = 12;
  const MIN_DIGITS = 2;
  const HIGHLIGHTED_BACKGROUND = "rgba(254, 241, 96, 0.2)";

  $: lines = highlighted.split("\n");
  $: len_digits = lines.length.toString().length;
  $: len = len_digits - MIN_DIGITS < 1 ? MIN_DIGITS : len_digits;
  $: width = len * DIGIT_WIDTH;
</script>

<div style:overflow-x="auto" {...$$restProps}>
  <table>
    <tbody class:hljs={true}>
      {#each lines as line, i}
        {@const lineNumber = i + startingLineNumber}
        <tr>
          <td
            class:hljs={true}
            class:hideBorder
            style:position="sticky"
            style:left="0"
            style:text-align="right"
            style:user-select="none"
            style:width={width + "px"}
          >
            <code style:color="var(--line-number-color, currentColor)">
              {lineNumber}
            </code>
            {#if highlightedLines.includes(i)}
              <div
                class:line-background={true}
                style:background="var(--highlighted-background, {HIGHLIGHTED_BACKGROUND})"
              />
            {/if}
          </td>
          <td>
            <pre class:wrapLines><code>{@html line || "\n"}</code></pre>
            {#if highlightedLines.includes(i)}
              <div
                class:line-background={true}
                style:background="var(--highlighted-background, {HIGHLIGHTED_BACKGROUND})"
              />
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
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

  tr:first-of-type td {
    padding-top: 1em;
  }

  tr:last-child td {
    padding-bottom: 1em;
  }

  td {
    padding-left: var(--padding-left, 1em);
    padding-right: var(--padding-right, 1em);
  }

  td.hljs:not(.hideBorder):after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: var(--border-color, currentColor);
  }

  .wrapLines {
    white-space: pre-wrap;
  }

  td,
  td > code,
  pre {
    position: relative;
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
</style>
