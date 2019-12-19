<script>
  export let language = { name: undefined, register: undefined };
  export let className = 'svelte-highlight';
  export let _className = className;
  export { _className as class };
  export let code = undefined;
  export let id = undefined;
  export let style = undefined;

  import { hljs } from './hljs';

  let block = undefined;

  $: _class = [className || _className, language.name].filter(Boolean).join(' ');
  $: {
    if (language.name && language.register) {
      hljs.registerLanguage(language.name, language.register);
    }

    if (block) {
      if (code) {
        block.querySelector('code').innerText = code;
      }

      hljs.highlightBlock(block);
    }
  }
</script>

<pre {id} {style} bind:this={block} class={_class}>
  <code>
    <slot>{code}</slot>
  </code>
</pre>
