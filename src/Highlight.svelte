<script>
  export let language = { name: undefined, register: undefined };
  export let className = 'svelte-highlight';
  export let code = undefined;

  import { hljs } from './hljs';

  let block;

  $: _className = [className, language.name].filter(Boolean).join(' ');

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

<pre bind:this={block} class={_className}>
  <code>
    <slot>{code}</slot>
  </code>
</pre>
