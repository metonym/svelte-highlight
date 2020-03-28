<script>
  export let className = undefined;
  export let language = undefined;
  export let _code = undefined;
  export let renderCodeProp = false;
  export let style = undefined;
  export let contenteditable = false;
  export let spellcheck = false;

  import Highlight from './Highlight.svelte';

  const props = { contenteditable, spellcheck, style, language, className };
</script>

{#if renderCodeProp}
  <Highlight {...props} code={_code} />
{:else}
  <Highlight {...props}>{_code}</Highlight>
{/if}
