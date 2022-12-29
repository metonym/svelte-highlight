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
     * Set to `true` for lines to wrap.
     * @default false
     */
    wrapLines?: boolean;

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
  }

  export let highlighted: string;

  export let hideBorder = false;

  export let wrapLines = false;

  const DIGIT_WIDTH = 18;
  const MIN_DIGITS = 3;

  $: lines = highlighted.split("\n");
  $: len_digits = lines.length.toString().length;
  $: len = len_digits - MIN_DIGITS < 1 ? MIN_DIGITS : len_digits;
  $: width = len * DIGIT_WIDTH;
</script>

<div style:overflow-x="auto" {...$$restProps}>
  <table style:width="100%">
    <tbody class:hljs={true}>
      {#each lines as line, i}
        {@const lineNumber = i + 1}
        {@const isFirst = i === 0}
        {@const isLast = i === lines.length - 1}
        <tr>
          <td
            class:hljs={true}
            class:hideBorder
            style:position="sticky"
            style:left="0"
            style:text-align="right"
            style:user-select="none"
            style:padding-top={isFirst ? "1em" : undefined}
            style:padding-bottom={isLast ? "1em" : undefined}
            style:width={width + "px"}
            style:min-width={width + "px"}
          >
            <code style:color="var(--line-number-color, currentColor)">
              {lineNumber}
            </code>
          </td>
          <td>
            <pre class:wrapLines><code>{@html line || "\n"}</code></pre>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
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
</style>
