<script>
  import { hljs } from './hljs';
  export let language = { name: undefined, register: undefined };
  export let className = 'svelte-highlight';

  let block;

  $: {
    if (language.name && language.register) {
      hljs.registerLanguage(language.name, language.register);
    }

    if (block) {
      hljs.highlightBlock(block);
    }
  }
</script>

<pre bind:this={block} class={className}>
  <code>
    <slot />
  </code>
</pre>
