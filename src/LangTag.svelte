<script>
  /** @type {any} */
  export let code;

  /** @type {string} */
  export let highlighted;

  /** @type {import('./languages').LanguageName | (string & {})} */
  export let languageName = "plaintext";

  /** @type {boolean} */
  export let langtag = false;

  /**
   * Bindable reference to the rendered `<code>` element, for callers (e.g.
   * `Highlight`'s "css-highlights" engine) that need to manage its DOM
   * imperatively after mount without duplicating this markup.
   * @type {HTMLElement | undefined}
   */
  export let codeElement = undefined;
</script>

<pre
  class:langtag={langtag}
  data-language={languageName}
  style:overflow-x="var(--overflow-x, auto)"
  style:overflow-y="var(--overflow-y, auto)"
  style:border-radius="var(--border-radius, 0)"
  style:width="var(--width, auto)"
  style:max-width="var(--max-width, none)"
  {...$$restProps}
><code
    bind:this={codeElement}
    class:hljs={true}
    >{#if highlighted}{@html highlighted}{:else}{code}{/if}</code
  ></pre>

<style>
  @import "./langtag.css";
</style>
