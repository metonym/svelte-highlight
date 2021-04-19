<script>
  import HighlightSvelte from "svelte-highlight/src/HighlightSvelte.svelte";
  import Highlight from "svelte-highlight/src/Highlight.svelte";
  import javascript from "svelte-highlight/src/languages/javascript";
  import "svelte-highlight/src/styles/agate.css";

  $: code = `const a = 4 + 3;`;

  const codeSvelte = `<script>
    export let a = null;

    import { onMount } from "svelte";
  <\/script>
  
  <h1 on:click={() => {console.log(0)}}>Hello</h1>`;
</script>

<Highlight code="{code}" language="{javascript}" />

<HighlightSvelte code="{codeSvelte}" />
