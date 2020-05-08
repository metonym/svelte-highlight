<script>
  export let currentStyle = undefined;

  import { Highlight, HighlightSvelte } from "svelte-highlight";

  let activeTabIndex = 0;

  let code = "const add = (a: number, b: number) => a + b;";

  $: _code = `<script>
  import { Highlight } from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import 'svelte-highlight/styles/${currentStyle}.css';

  $: code = \`${code}\`;
<\/script>

<Highlight language={typescript} {code} />`;

  $: _codeJavaScript = `<script>
  import { Highlight } from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import { ${currentStyle} } from 'svelte-highlight/styles';

  $: code = \`${code}\`;
<\/script>

<svelte:head>
  {@html ${currentStyle}}
</svelte:head>

<Highlight language={typescript} {code} />`;
</script>

<style>
  .container {
    display: inline-block;
    border: 2px solid #f4f4f4;
  }

  :global(code) {
    font-family: "Menlo", monospace;
    font-size: 0.75rem;
    line-height: 1.5;
  }

  :global(.hljs.hljs) {
    padding: 1rem 1.25rem;
  }

  ul {
    display: flex;
  }

  li {
    cursor: pointer;
  }
</style>

<section>
  <h2>Usage</h2>
  <ul role="tablist">
    {#each ['Injected Styles', 'CSS Stylesheet'] as item, i (item)}
      <li class:active={i === activeTabIndex}>
        <button
          type="button"
          on:click={() => {
            activeTabIndex = i;
          }}>
          {item}
        </button>
      </li>
    {/each}
  </ul>
  <div class="container">
    {#if activeTabIndex === 0}
      <HighlightSvelte code={_codeJavaScript} />
    {:else if activeTabIndex === 1}
      <HighlightSvelte code={_code} />
    {/if}
  </div>
</section>
