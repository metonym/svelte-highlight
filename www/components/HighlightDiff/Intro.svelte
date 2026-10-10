<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { HighlightDiff } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { tsAfter, tsBefore } from "./samples.js";

  /** @type {"unified" | "split"} */
  let view = "split";
</script>

<HighlightDiff
  before={tsBefore}
  after={tsAfter}
  language={typescript}
  bind:view
  class={THEME_MODULE_NAME}
  style="height: 420px"
/>
<p class="label-01 mt-3">
  Click the diff, then press <code class="code">n</code>/<code class="code"
    >p</code
  >
  to move between changes and <code class="code">v</code> to switch views ({view}).
</p>
