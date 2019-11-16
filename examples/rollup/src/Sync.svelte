<script>
  import Highlight from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import { github } from 'svelte-highlight/styles';
</script>

<svelte:head>
  {@html github}
</svelte:head>

<Highlight language={typescript}>
  {`function add(a: number, b: number) {
  return a + b;
}

const sum = add(1, 2);`}
</Highlight>
