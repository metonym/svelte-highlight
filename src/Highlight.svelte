<script>
  export let language = { name: undefined, register: undefined };
  export let code = undefined;

  import hljs from "highlight.js/lib/highlight";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let highlighted = undefined;

  $: {
    if (language.name && language.register) {
      hljs.registerLanguage(language.name, language.register);
    }

    highlighted = hljs.highlight(language.name, code).value;
    dispatch("highlight");
  }
</script>

<slot {highlighted}>
  <pre {...$$restProps} class:hljs={true}>
    <code>
      {@html highlighted}
    </code>
  </pre>
</slot>
