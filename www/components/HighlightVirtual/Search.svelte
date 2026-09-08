<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button, Search } from "carbon-components-svelte";
  import { onDestroy } from "svelte";
  import { HighlightVirtual } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { createSearch, highlightMatches } from "svelte-highlight/search";
  import "svelte-highlight/search.css";
  import { generateTypeScript } from "./generate-large-code.js";

  const LINE_COUNT = 20_000;
  const code = generateTypeScript(LINE_COUNT);
  const search = createSearch(code);

  let query = "value";
  let label = "0 of 0";

  /** @type {HighlightVirtual} */
  let ref;
  /** @type {HTMLElement} */
  let root;
  let dispose = () => {};

  function repaint() {
    if (!root) return;
    dispose();
    dispose = highlightMatches(root, search.matches(), {
      current: search.current()?.index,
    }).dispose;
  }

  const unsubscribe = search.onChange(() => {
    const current = search.current();
    const count = search.count();
    label = count === 0 ? "0 of 0" : `${(current?.index ?? 0) + 1} of ${count}`;
    repaint();
  });

  onDestroy(() => {
    dispose();
    unsubscribe();
  });

  $: search.query(query);

  function jump(match) {
    if (match) ref?.scrollToLine(match.line);
  }
</script>

<div
  style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 1rem; margin-bottom: 1rem"
>
  <Search bind:value={query} labelText="Find in document" size="sm" />
  <Button size="small" kind="tertiary" on:click={() => jump(search.prev())}>
    Prev
  </Button>
  <Button size="small" kind="tertiary" on:click={() => jump(search.next())}>
    Next
  </Button>
  <p class="label-01" style="margin-bottom: 0.5rem">
    Match <code class="code">{label}</code>
  </p>
</div>

<div bind:this={root}>
  <HighlightVirtual
    bind:this={ref}
    language={typescript}
    {code}
    class={THEME_MODULE_NAME}
    style="height: 320px"
    on:windowchange={repaint}
  />
</div>
