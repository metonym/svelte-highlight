<script>
  export let code = "";
  export let highlighted = "";

  /**
   * @type {{name: string; register: any;}}
   */
  export let language = { name: undefined, register: undefined };

  import hljs from "highlight.js/lib/core";

  $: if (language.name !== undefined) {
    hljs.registerLanguage(language.name, language.register);
    highlighted = hljs.highlight(language.name, code).value;
  }
</script>

<pre class:hljs="{true}">
  <code>{@html highlighted}</code>
</pre>
