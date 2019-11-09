<script>
  import Highlight from './Highlight.svelte';

  export let className = undefined;
  export let language = undefined;
  export let _code = undefined;
</script>

<Highlight {language} {className}>{_code}</Highlight>
