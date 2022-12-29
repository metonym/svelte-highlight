<script context="module" lang="ts">
  import type { LanguageFn } from "highlight.js";

  export type HighlightedCode = undefined | string;

  export interface Language {
    name?: string;
    register: LanguageFn;
  }

  export interface Slots {
    default: {
      /**
       * The highlighted code.
       */
      highlighted: HighlightedCode;
    };
  }

  export interface Events {
    highlight: CustomEvent<{
      /**
       * The highlighted code.
       */
      highlighted?: HighlightedCode;
    }>;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface $$Props extends HTMLAttributes<HTMLPreElement> {
    /**
     * Specify the source code to highlight.
     */
    code?: any;

    /**
     * Provide the language to highlight the code.
     * Import languages from `svelte-highlight/languages/*`.
     */
    language?: Language;

    /**
     * Set to `true` for the language name to be
     * displayed at the top right of the code block.
     *
     * Use CSS variables to customize styles:
     * - `--hljs-background`
     * - `--hljs-foreground`
     * - `--hljs-radius`
     */
    langtag?: boolean;
  }

  interface $$Slots extends Slots {}

  interface $$Events extends Events {}

  export let language: Language = {
    name: undefined,
    register: undefined,
  };

  export let code = undefined;

  export let langtag = false;

  import hljs from "highlight.js/lib/core";
  import { createEventDispatcher, afterUpdate } from "svelte";

  const dispatch = createEventDispatcher();

  let highlighted: HighlightedCode = undefined;

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
    background: var(--hljs-background);
    color: var(--hljs-foreground);
    border-radius: var(--hljs-radius);
  }
</style>
