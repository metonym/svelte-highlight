<script>
  // @ts-check

  /** @type {any} */
  export let code;

  /** @type {string} */
  export let highlighted;

  /** @type {string} */
  export let languageName = "plaintext";

  /** @type {boolean} */
  export let langtag = false;
</script>

<pre class:langtag data-language={languageName} {...$$restProps}><code
    class:hljs={true}
    >{#if highlighted}{@html highlighted}{:else}{code}{/if}</code
  ></pre>

<style>
  .langtag {
    position: relative;
  }

  .langtag::after {
    content: attr(data-language);
    position: absolute;
    top: 0;
    right: 0;
    padding: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--langtag-background, inherit);
    color: var(--langtag-color, inherit);
    border-radius: var(--langtag-border-radius);
  }
</style>
