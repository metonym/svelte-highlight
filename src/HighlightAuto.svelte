<script context="module" lang="ts">
  import type { Slots } from "./Highlight.svelte";
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface $$Props extends HTMLAttributes<HTMLPreElement> {
    /**
     * Specify the source code to highlight.
     */
    code: any;

    /**
     * Set to `true` for the language name to be
     * displayed at the top right of the code block.
     *
     * Use style props to customize styles:
     * - `--hljs-background`
     * - `--hljs-foreground`
     * - `--hljs-radius`
     *
     * @default false
     */
    langtag?: boolean;

    /**
     * Customize the background color of the langtag.
     */
    "--hljs-background"?: string;

    /**
     * Customize the text color of the langtag.
     */
    "--hljs-foreground"?: string;

    /**
     * Customize the border radius of the langtag.
     */
    "--hljs-radius"?: string;
  }

  interface $$Slots extends Slots {}

  interface $$Events {
    highlight: CustomEvent<{
      /**
       * The highlighted HTML as a string.
       * @example "<span>...</span>"
       */
      highlighted: string;

      /**
       * The inferred language name.
       * @example "css"
       */
      language?: string;
    }>;
  }

  export let code;

  export let langtag = false;

  import hljs from "highlight.js";
  import { createEventDispatcher, afterUpdate } from "svelte";

  const dispatch = createEventDispatcher();

  let highlighted = "";
  let language = undefined;

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted, language });
  });

  $: ({ value: highlighted, language } = hljs.highlightAuto(code));
</script>

<slot {highlighted}>
  <pre
    class:langtag
    data-language={language || "plaintext"}
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
