<script>
  /** @type {{ name?: string; register: (hljs: any) => Record<string, any>; }} */
  export let language = { name: undefined, register: undefined };
  export let className = "svelte-highlight";
  export let _className = className;
  export { _className as class };

  /** @type {string} */
  export let code = undefined;

  /** @type {string} */
  export let id = undefined;

  /** @type {string} */
  export let style = undefined;

  /** @type {boolean | "true" | "false"} */
  export let contenteditable = undefined;

  /** @type {boolean} */
  export let spellcheck = undefined;

  import hljs from "highlight.js/lib/highlight";

  let block = undefined;

  $: _class = [className || _className, language.name]
    .filter(Boolean)
    .join(" ");
  $: {
    if (language.name && language.register) {
      hljs.registerLanguage(language.name, language.register);
    }

    if (block) {
      if (code && block.querySelector("code") != null) {
        block.querySelector("code").innerText = code;
      }

      hljs.highlightBlock(block);
    }
  }
</script>

<pre
  bind:this="{block}"
  id="{id}"
  style="{style}"
  contenteditable="{contenteditable}"
  spellcheck="{spellcheck}"
  class="{_class}"
  on:blur="{({ target }) => {
    if (contenteditable !== undefined && contenteditable !== 'false') {
      code = target.innerText;
      if (block.querySelector('code') == null) {
        block.innerHTML = '<code></code>';
      }
    }
  }}">
  <code>
    <slot>{code}</slot>
  </code>
</pre>
