<script>
  import { onDestroy } from "svelte";
  import { HighlightVirtual } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  import { createSearch, highlightMatches } from "../../src/search.js";

  export let forceFallback = false;

  if (forceFallback) {
    Reflect.deleteProperty(CSS, "highlights");
  }

  const LINE_COUNT = 4000;

  // A 5-line cluster of matches every 200 lines: dense enough that several
  // land in the same rendered window together (some current, some not), but
  // spaced out enough that later clusters start outside the initial window.
  function generateCode(lines) {
    let out = "";
    for (let i = 0; i < lines; i++) {
      const word = i % 200 < 5 ? "NEEDLE" : `x${i}`;
      out += `const ${word} = ${i}; // line ${i}\n`;
    }
    return out;
  }

  const code = generateCode(LINE_COUNT);
  const search = createSearch(code);

  /** @type {import("../../src/HighlightVirtual.svelte").default} */
  let ref;
  /** @type {HTMLDivElement} */
  let rootEl;

  let count = 0;
  let dispose = () => {};

  function repaint() {
    dispose();
    dispose = highlightMatches(rootEl, search.matches(), {
      current: search.current()?.index,
    }).dispose;
  }

  const unsubscribe = search.onChange(() => {
    count = search.count();
    repaint();
  });

  onDestroy(() => {
    dispose();
    unsubscribe();
  });

  function onInput(event) {
    search.query(event.currentTarget.value);
  }

  function next() {
    const match = search.next();
    if (match) ref?.scrollToLine(match.line);
  }

  function prev() {
    const match = search.prev();
    if (match) ref?.scrollToLine(match.line);
  }
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<input data-testid="query" on:input={onInput}>
<span data-testid="count">{count}</span>
<button type="button" data-testid="next" on:click={next}>Next</button>
<button type="button" data-testid="prev" on:click={prev}>Prev</button>

<div bind:this={rootEl}>
  <HighlightVirtual
    bind:this={ref}
    language={javascript}
    {code}
    data-testid="virtual"
    style="height: 300px; width: 600px;"
    on:windowchange={repaint}
  />
</div>
