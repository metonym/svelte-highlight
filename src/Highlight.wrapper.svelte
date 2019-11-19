<script>
  export let className = undefined;
  export let language = undefined;
  export let _code = undefined;
  export let renderCodeProp = false;

  import Highlight from './Highlight.svelte';

  const props = { language, className };
</script>

{#if renderCodeProp}
  <Highlight {...props} code={_code} />
{:else}
  <Highlight {...props}>{_code}</Highlight>
{/if}
