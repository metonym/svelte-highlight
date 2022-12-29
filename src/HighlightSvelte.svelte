<script context="module" lang="ts">
  import type { Slots, Events } from "./Highlight.svelte";
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface $$Props extends HTMLAttributes<HTMLPreElement> {
    /**
     * Specify the source code to highlight.
     */
    code?: any;

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

  export let code = undefined;

  export let langtag = false;

  import hljs from "highlight.js/lib/core";
  import xml from "highlight.js/lib/languages/xml";
  import javascript from "highlight.js/lib/languages/javascript";
  import css from "highlight.js/lib/languages/css";
  import { createEventDispatcher, afterUpdate } from "svelte";

  const dispatch = createEventDispatcher();

  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("css", css);

  afterUpdate(() => {
    if (highlighted) dispatch("highlight", { highlighted });
  });

  $: highlighted = hljs.highlightAuto(code).value;
</script>

<slot {highlighted}>
  <pre class:langtag data-language="svelte" {...$$restProps}><code class="hljs"
      >{@html highlighted}</code
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
