<script context="module" lang="ts">
  import type { Props } from "./shared";
</script>

<script lang="ts">
  interface $$Props extends Omit<Props, "language"> {
    /**
     * Specify the highlighted code.
     */
    highlighted: string | undefined;

    /**
     * Specifiy the language name.
     * @default "plaintext"
     */
    languageName?: string;
  }

  export let langtag = false;

  export let highlighted: $$Props["highlighted"];

  export let code: $$Props["code"];

  export let languageName = "plaintext";
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
