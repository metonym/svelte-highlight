<script>
  /**
   * @slot {{ highlighted: string; }}
   * @event {string} highlight
   */

  export let code = "";
  export let highlighted = "";

  /**
   * @type {{name: string; register: any;}}
   */
  export let language = { name: undefined, register: undefined };

  import hljs from "highlight.js/lib/core";
  import { createEventDispatcher, tick } from "svelte";

  const dispatch = createEventDispatcher();

  $: if (language.name !== undefined) {
    hljs.registerLanguage(language.name, language.register);
    highlighted = hljs.highlight(language.name, code).value;
    tick().then(() => dispatch("highlight", highlighted));
  }
</script>

<slot highlighted="{highlighted}">
  <pre {...$$restProps} class:hljs="{true}">
    <code>
      {@html highlighted}
    </code>
  </pre>
</slot>
