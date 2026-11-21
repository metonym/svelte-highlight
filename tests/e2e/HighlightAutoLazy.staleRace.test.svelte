<script lang="ts">
  import { tick } from "svelte";
  import { HighlightAutoLazy } from "svelte-highlight";
  import { highlightAutoLazy } from "svelte-highlight/auto-detect";

  const css = "@media (max-width: 600px) {\n  body { background: #000; }\n}";
  const go =
    'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("hi")\n}\n';

  let code = css;
  let dispatchCount = 0;
  let language = "";
  let done = false;

  // The css grammars loaded on mount, so css now resolves at once. Go
  // needs a load. Switch to go, then back to css before the go load ends.
  // The go result arrives last and must not replace the css one.
  async function race() {
    dispatchCount = 0;
    code = go;
    await tick();
    code = css;
    await tick();
    // Same shared registry and module cache as the component, so this
    // resolves after the component's own go load.
    await highlightAutoLazy(go);
    await new Promise((resolve) => setTimeout(resolve, 50));
    done = true;
  }
</script>

<HighlightAutoLazy
  {code}
  langtag
  on:highlight={(e) => {
    dispatchCount++;
    language = e.detail.language;
  }}
/>

<button type="button" on:click={race}>Race</button>
<p data-testid="dispatch-count">{dispatchCount}</p>
<p data-testid="language">{language}</p>
<p data-testid="done">{done}</p>
