<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { onMount } from "svelte";
  import { HighlightEditable } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import horizonDark from "svelte-highlight/styles/horizon-dark";

  let editor;
  let code = "const add = (a: number, b: number) => a + b;";
  /** @type {"dom" | "css-highlights" | undefined} */
  let resolvedEngine;

  // resolvedEngine() changes after mount, once the color resolver loads.
  onMount(() => {
    const timer = setInterval(() => {
      resolvedEngine = editor?.resolvedEngine();
    }, 250);
    return () => clearInterval(timer);
  });
</script>

<!-- class provides the base `.hljs`/`pre code.hljs` layout rules (from the
site-wide theme stylesheet); theme additionally generates the
`::highlight()` token-color rules this engine actually paints with. -->
<HighlightEditable
  bind:this={editor}
  language={typescript}
  bind:code
  engine="css-highlights"
  theme={horizonDark}
  class={THEME_MODULE_NAME}
/>

<p class="label-01" style="margin-top: 0.75rem">
  resolvedEngine(): <code class="code">{resolvedEngine}</code>
</p>
