<script>
  export let language = { name: undefined, register: undefined };
  export let className = "svelte-highlight";
  export let _className = className;
  export { _className as class };
  export let code = undefined;
  export let id = undefined;
  export let style = undefined;
  export let contenteditable = undefined;
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
  bind:this={block}
  {id}
  {style}
  {contenteditable}
  {spellcheck}
  class={_class}
  on:blur={({ target }) => {
    if (contenteditable !== undefined && contenteditable !== 'false') {
      code = target.innerText;
      if (block.querySelector('code') == null) {
        block.innerHTML = '<code></code>';
      }
    }
  }}>
  <code>
    <slot>{code}</slot>
  </code>
</pre>
