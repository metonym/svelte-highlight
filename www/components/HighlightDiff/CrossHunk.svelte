<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import {
    diffTexts,
    Highlight,
    HighlightDiff,
    toUnifiedPatch,
  } from "svelte-highlight";
  import diff from "svelte-highlight/languages/diff";
  import typescript from "svelte-highlight/languages/typescript";
  import { crossHunkAfter, crossHunkBefore } from "./samples.js";

  const patch = toUnifiedPatch(diffTexts(crossHunkBefore, crossHunkAfter), {
    context: 1,
  });
</script>

<p class="label-01 mb-3">
  The first change sits inside a block comment and the second inside a template
  literal, both opened far above their hunks. HighlightDiff tokenizes both full
  files, so they stay a comment and a string. A fragment-only highlighter
  (right) sees <code class="code">if (x) {"{"}</code>
  and <code class="code">const y = 2</code> as code — or, with the
  <code class="code">diff</code>
  grammar, can't color the code at all.
</p>
<div class="pair">
  <HighlightDiff
    before={crossHunkBefore}
    after={crossHunkAfter}
    language={typescript}
    context={1}
    minimap={false}
    class={THEME_MODULE_NAME}
    style="height: 340px"
  />
  <div class="fragments">
    <Highlight code={patch} language={diff} class={THEME_MODULE_NAME} />
  </div>
</div>

<style>
  .pair {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 1rem;
  }

  .fragments {
    max-height: 340px;
    overflow: auto;
    font-size: 13px;
  }
</style>
