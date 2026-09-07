<script>
  import { generateTypeScript } from "@components/HighlightVirtual/generate-large-code.js";
  import { THEME_MODULE_NAME } from "@www/constants";
  import { onMount } from "svelte";
  import { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { createTokenizedDocument } from "svelte-highlight/tokenized-document";

  const LINE_COUNT = 5_000;
  const OVERSCAN = 10;
  const CONTAINER_HEIGHT = 320;

  const doc = createTokenizedDocument({ language: typescript });
  doc.setCode(generateTypeScript(LINE_COUNT));
  const lineCount = doc.lineCount();

  /** @type {HTMLElement} */
  let container;
  // Re-measured from a rendered row after mount; only an initial guess.
  let rowHeight = 24;
  let start = 0;
  let end = Math.min(
    lineCount,
    Math.ceil(CONTAINER_HEIGHT / rowHeight) + OVERSCAN,
  );

  function updateWindow() {
    if (!container) return;
    const row = container.querySelector("tbody tr");
    if (row) rowHeight = row.getBoundingClientRect().height || rowHeight;
    const first = Math.max(
      0,
      Math.floor(container.scrollTop / rowHeight) - OVERSCAN,
    );
    const visible =
      Math.ceil(container.clientHeight / rowHeight) + OVERSCAN * 2;
    start = Math.min(first, lineCount);
    end = Math.min(lineCount, start + visible);
  }

  onMount(updateWindow);

  $: lines = doc.lineRange(start, end);
</script>

<p class="label-01 mb-3">
  {lineCount.toLocaleString()}
  lines total. <code class="code">lines</code>
  only ever holds the scrolled-into-view window;
  <code class="code">lineCount</code>
  keeps the gutter sized for the full document.
</p>

<div
  bind:this={container}
  on:scroll={updateWindow}
  style="height: {CONTAINER_HEIGHT}px; overflow-y: auto; position: relative;"
>
  <div style="height: {lineCount * rowHeight}px; position: relative;">
    <div
      style="position: absolute; top: {start * rowHeight}px; left: 0; right: 0;"
    >
      <LineNumbers
        {lines}
        startingLineNumber={start + 1}
        {lineCount}
        class={THEME_MODULE_NAME}
      />
    </div>
  </div>
</div>
