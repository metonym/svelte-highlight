<script>
  /** @type {any} */
  export let code;

  /** @type {string} */
  export let highlighted;

  /** @type {import('./languages').LanguageName | (string & {})} */
  export let languageName = "plaintext";

  /** @type {boolean} */
  export let langtag = false;

  /** @type {boolean} */
  export let wrap = false;

  /**
   * Accessible name of the scrollable code region. Inside a CodeWindow, the
   * window's `title` or `label` is the default.
   * @type {string | undefined}
   */
  export let label = undefined;

  import { getContext } from "svelte";
  import { CODE_REGION, NO_REGION_LABEL } from "./code-region.js";

  /** @type {import("svelte/store").Readable<string | undefined>} */
  const windowLabel = getContext(CODE_REGION) ?? NO_REGION_LABEL;
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<pre
  class:langtag
  class:wrap
  data-language={languageName}
  style:overflow-x="var(--overflow-x, auto)"
  style:overflow-y="var(--overflow-y, auto)"
  style:border-radius="var(--border-radius, 0)"
  style:width="var(--width, auto)"
  style:max-width="var(--max-width, none)"
  {...$$restProps}><code
    class:hljs={true}
    tabindex="0"
    role="region"
    aria-label={label ?? $windowLabel ?? "Code"}
    >{#if highlighted}{@html highlighted}{:else}{code}{/if}</code
  ></pre>

<style>
  @import "./langtag.css";

  pre {
    direction: ltr;
  }

  /* Draw the ring inside, or the scrolling <pre> clips it in Safari. */
  code:focus-visible {
    outline-offset: -2px;
  }
</style>
