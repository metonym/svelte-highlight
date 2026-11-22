<script>
  import { onMount } from "svelte";
  import { highlightAll } from "svelte-highlight/dom.js";

  /** @type {HTMLElement} */
  let root;
  let result = "";

  onMount(() => {
    const run = highlightAll(root);
    run.ready.then(({ highlighted, failed }) => {
      result = `${highlighted} highlighted, ${failed} failed`;
    });
    return run.destroy;
  });
</script>

<div bind:this={root}>
  <pre><code class="language-typescript">const add = (a, b) => a + b;</code
    ></pre>
  <pre><code class="language-python">def add(a, b): return a + b</code></pre>
  <pre><code class="language-not-a-language">plain</code></pre>
  <pre><code>no class</code></pre>
</div>
<p data-testid="result">{result}</p>
