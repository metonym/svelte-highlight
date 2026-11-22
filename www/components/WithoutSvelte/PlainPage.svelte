<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import { onMount } from "svelte";
  import Highlight from "svelte-highlight";
  import xml from "svelte-highlight/languages/xml";

  const snippet = `<pre><code class="language-python">def add(a, b):
    return a + b</code></pre>

<script type="module">
  import { highlightAll } from "svelte-highlight/dom";

  const { ready } = highlightAll();
  console.log(await ready); // { highlighted: 2, failed: 0 }
<\/script>`;

  /** @type {HTMLElement} */
  let root;
  /** @type {import("svelte-highlight/dom").HighlightAllResult | undefined} */
  let run;
  let status = "Plain markup, not highlighted yet.";

  async function highlight() {
    const { highlightAll } = await import("svelte-highlight/dom");
    run = highlightAll(root);
    const { highlighted, failed } = await run.ready;
    status = `${highlighted} highlighted, ${failed} failed.`;
  }

  function restore() {
    run?.destroy();
    run = undefined;
    status = "Restored the original text.";
  }

  onMount(() => () => run?.destroy());
</script>

<Highlight language={xml} code={snippet} class={THEME_MODULE_NAME} />

<!-- The docs scope their theme to a class. -->
<div class="demo {THEME_MODULE_NAME}" bind:this={root}>
  <pre><code class="language-python"
      >def add(a, b):
    return a + b</code
    ></pre>
  <pre><code class="language-css">.card {"{"} color: rebeccapurple; {"}"}</code
    ></pre>
</div>
<div class="controls">
  {#if run}
    <Button size="small" kind="tertiary" on:click={restore}>destroy()</Button>
  {:else}
    <Button size="small" kind="tertiary" on:click={highlight}
      >highlightAll()</Button
    >
  {/if}
  <span>{status}</span>
</div>

<style>
  .demo :global(pre) {
    margin-top: var(--cds-spacing-05);
  }

  /* The docs' theme puts block layout on \`pre.<theme> code.hljs\`. */
  .demo :global(pre code.hljs) {
    display: block;
    overflow-x: auto;
    padding: 1em;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-05);
    margin-top: var(--cds-spacing-05);
  }
</style>
