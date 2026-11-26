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

  /**
   * Bindable `<code>` element, for callers that paint it after mount
   * (e.g. `Highlight`'s "css-highlights" engine).
   * @type {HTMLElement | undefined}
   */
  export let codeElement = undefined;

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
    bind:this={codeElement}
    class:hljs={true}
    tabindex="0"
    role="region"
    aria-label={label ?? $windowLabel ?? "Code"}
    >{#if highlighted}{@html highlighted}{:else}{code}{/if}</code
  ></pre>

<style>
  /* Inline, not imported: injected CSS keeps a relative import as written,
     and the browser resolves it against the page URL (#663). */
  .langtag {
    position: relative;
  }

  .wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .langtag::after {
    content: attr(data-language);
    position: absolute;
    top: var(--langtag-top, 0);
    right: var(--langtag-right, 0);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--langtag-background, inherit);
    color: var(--langtag-color, inherit);
    border-radius: var(--langtag-border-radius, 0);
    padding: var(--langtag-padding, 1em);
    font-size: var(--langtag-font-size, inherit);
  }

  pre {
    direction: ltr;
  }

  /* Draw the ring inside, or the scrolling <pre> clips it in Safari. */
  code:focus-visible {
    outline-offset: -2px;
  }
</style>
