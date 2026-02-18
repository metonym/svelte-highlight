<script>
  /** @type {any} */
  export let code;

  /** @type {string} */
  export let highlighted;

  /** @type {import('./languages').LanguageName | (string & {})} */
  export let languageName = "plaintext";

  /** @type {boolean} */
  export let langtag = false;

  let copyBtnText = "Copy";
  function onCopyBtnClicked() {
    copyBtnText = "Copied!";
    setTimeout(() => {
      copyBtnText = "Copy";
    }, 1000);
    navigator.clipboard.writeText(code);
  }
</script>

<div class="copy-btn-container">
  <button class="copy-btn" on:click={() => onCopyBtnClicked()}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="copy-icon"
      ><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path
        d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
      /></svg
    >
    <span class="copy-text">{copyBtnText}</span>
  </button>
</div>

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
    top: var(--langtag-top, 0);
    right: var(--langtag-right, 0);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--langtag-background, inherit);
    color: var(--langtag-color, inherit);
    border-radius: var(--langtag-border-radius, 0);
    padding: var(--langtag-padding, 1em);
  }

  .copy-btn-container {
    width: 100%;
    display: flex;
    justify-content: end;
    align-items: center;
    float: right;
    padding: 5px;
  }

  .copy-btn {
    display: flex;
    align-items: center;
    background: var(--langtag-background, inherit);
    color: var(--langtag-color, inherit);
    border: none;
  }

  .copy-icon {
    width: 20px;
    height: 20px;
    padding-right: 5px;
  }
</style>
