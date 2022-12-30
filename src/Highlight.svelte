<script context="module" lang="ts">
  import type { LanguageFn } from "highlight.js";

  export interface Language {
    name?: string;
    register: LanguageFn;
  }

  export interface Slots {
    default: {
      /**
       * The highlighted HTML as a string.
       * @example "<span>...</span>"
       */
      highlighted: string;
    };
  }

  export interface Events {
    highlight: CustomEvent<{
      /**
       * The highlighted HTML as a string.
       * @example "<span>...</span>"
       */
      highlighted: string;
    }>;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface $$Props extends HTMLAttributes<HTMLPreElement> {
    /**
     * Specify the source code to highlight.
     */
    code: any;

    /**
     * Provide the language grammar used to highlight the code.
     * Import languages from `svelte-highlight/languages/*`.
     * @example
     * import typescript from "svelte-highlight/languages/typescript";
     */
    language: Language;

    /**
     * Set to `true` for the language name to be
     * displayed at the top right of the code block.
     *
     * Use style props to customize styles:
     * - `--langtag-background`
     * - `--langtag-color`
     * - `--langtag-border-radius`
     *
     * @default false
     */
    langtag?: boolean;

    /**
     * Customize the background color of the langtag.
     */
    "--langtag-background"?: string;

    /**
     * Customize the text color of the langtag.
     */
    "--langtag-color"?: string;

    /**
     * Customize the border radius of the langtag.
     */
    "--langtag-border-radius"?: string;
  }

  interface $$Slots extends Slots {}

  interface $$Events extends Events {}

  export let language: Language;

  export let code: any;

  export let langtag = false;

  import hljs from "highlight.js/lib/core";
  import { createEventDispatcher, afterUpdate } from "svelte";

  const dispatch = createEventDispatcher();

  let highlighted = "";

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted });
  });

  $: if (language.name && language.register) {
    hljs.registerLanguage(language.name, language.register);
    highlighted = hljs.highlight(code, { language: language.name }).value;
  }
</script>

<slot {highlighted}>
  <pre
    class:langtag
    data-language={language.name || "plaintext"}
    {...$$restProps}><code class="hljs"
      >{#if highlighted !== undefined}{@html highlighted}{:else}{code}{/if}</code
    ></pre>
</slot>

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
    background: inherit;
    color: inherit;
    background: var(--langtag-background);
    color: var(--langtag-color);
    border-radius: var(--langtag-border-radius);
  }
</style>
