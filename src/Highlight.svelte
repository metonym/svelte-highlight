<script>
  export let language = { name: undefined, register: undefined };
  export let code = undefined;

  import hljs from "highlight.js/lib/highlight";
  import { createEventDispatcher, afterUpdate } from "svelte";

  const dispatch = createEventDispatcher();

  let highlighted = undefined;

  afterUpdate(() => {
    if (highlighted) {
      dispatch("highlight");
    }
  });

  $: if (language.name && language.register) {
    hljs.registerLanguage(language.name, language.register);
    highlighted = hljs.highlight(language.name, code).value;
  }
</script>

<slot {highlighted}>
  <pre
    {...$$restProps}
    on:click
    on:mouseover
    on:mouseenter
    on:mouseleave
    on:focus
    on:blur
    class:hljs={true}>
    <code>
      {#if highlighted !== undefined}
        {@html highlighted}
      {:else}{code}{/if}
    </code>
  </pre>
</slot>
