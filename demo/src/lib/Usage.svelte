<script>
  export let active = false;

  import { Row, Column } from "carbon-components-svelte";
  import HighlightSvelte from "svelte-highlight/src/HighlightSvelte.svelte";
  import Highlight from "svelte-highlight/src/Highlight.svelte";
  import javascript from "svelte-highlight/src/languages/javascript";
  import github from "svelte-highlight/src/styles/github";
  //import "svelte-highlight/src/styles/agate.css";

  $: code = `const a = 4 + 3;`;

  const codeSvelte = `<script>
  export let a = null;

  import { onMount } from "svelte";
<\/script>

<h1 on:click={() => console.log(0)}>
Hello
</h1>`;
</script>

<svelte:head>
  {#if active}
    {@html github}
  {/if}
</svelte:head>

<Row>
  <Column lg="{5}">
    <h4>svelte</h4>
    <p>Start using it like...</p>
  </Column>
  <Column lg="{7}">
    <Highlight code="{code}" language="{javascript}" />

    <HighlightSvelte code="{codeSvelte}" />
  </Column>
</Row>

<Row>
  <Column lg="{5}">
    <h4>svelte</h4>
    <p>Start using it like...</p>
  </Column>
  <Column lg="{7}">
    <Highlight code="{code}" language="{javascript}" />

    <HighlightSvelte code="{codeSvelte}" />
  </Column>
</Row>
