<script>
  /** @type {any} */
  export let code;

  /** @type {string} */
  export let highlighted;

  /** @type {import('./languages').LanguageName | (string & {})} */
  export let languageName = "plaintext";

  /** @type {boolean} */
  export let langtag = false;

  /** @type {string} */
  export let label = "Code";

  // WCAG 2.1.1 scrollable-region-focusable: a static tabindex + region role
  // on the scrollable pre. Spread sidesteps Biome a11y rules that assume
  // tabindex/role only ever belong on interactive elements.
  $: regionAttrs = { tabindex: "0", role: "region", "aria-label": label };
</script>

<pre
  {...regionAttrs}
  class:langtag={langtag}
  data-language={languageName}
  style:overflow-x="var(--overflow-x, auto)"
  style:overflow-y="var(--overflow-y, auto)"
  style:border-radius="var(--border-radius, 0)"
  style:width="var(--width, auto)"
  style:max-width="var(--max-width, none)"
  {...$$restProps}
><code
    class:hljs={true}
    >{#if highlighted}{@html highlighted}{:else}{code}{/if}</code
  ></pre>

<style>
  @import "./langtag.css";
</style>
