<script>
  let { 
    /** @type {string} */
    highlighted,
    /** @type {boolean} */
    hideBorder = false,
    /** @type {boolean} */
    wrapLines = false,
    /** @type {number} */
    startingLineNumber = 1,
    /** @type {number[]} */
    highlightedLines = [],
    ...restProps
  } = $props();

  const DIGIT_WIDTH = 12;
  const MIN_DIGITS = 2;
  const HIGHLIGHTED_BACKGROUND = "rgba(254, 241, 96, 0.2)";

  let lines = $derived(highlighted.split("\n"));
  let len_digits = $derived(lines.length.toString().length);
  let len = $derived(len_digits - MIN_DIGITS < 1 ? MIN_DIGITS : len_digits);
  let width = $derived(len * DIGIT_WIDTH);
</script>

<div style:overflow-x="auto" {...restProps}>
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
              ></div>
            {/if}
          </td>
          <td>
            <pre class:wrapLines><code>{@html line || "\n"}</code></pre>
            {#if highlightedLines.includes(i)}
              <div
                class:line-background={true}
                style:background="var(--highlighted-background, {HIGHLIGHTED_BACKGROUND})"
              ></div>
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

  tr td:first-of-type {
    z-index: 2;
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
