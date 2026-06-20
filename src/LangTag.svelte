<script>
  /** @type {any} */
  export let code;

  /** @type {string} */
  export let highlighted;

  /** @type {import('./languages').LanguageName | (string & {})} */
  export let languageName = "plaintext";

  /** @type {boolean} */
  export let langtag = false;
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
    class:hljs={true}
    >{#if highlighted}{@html highlighted}{:else}{code}{/if}</code
  ></pre>

<style>
  @import "./langtag.css";
</style>
