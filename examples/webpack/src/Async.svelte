<script>
  import Highlight from 'svelte-highlight';
  import { onMount } from 'svelte';

  let language;
  let style;

  onMount(async () => {
    const { typescript } = await import('svelte-highlight/languages');
    language = typescript;

    const { github } = await import('svelte-highlight/styles');
    style = github;
  });

  $: loaded = language && style;
</script>

<svelte:head>
  {@html style}
</svelte:head>

{#if loaded}
  <Highlight {language}>
    {`function add(a: number, b: number) {
  return a + b;
}

const sum = add(1, 2);`}
  </Highlight>
{/if}
