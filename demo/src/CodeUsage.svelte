<script>
  export let currentStyle = undefined;
  export let code = undefined;

  // use v0.4.0 for `highlightjs-svelte`
  import Highlight from 'svelte-highlight';
  import hljs from 'highlight.js';
  import svelte from 'hljsSvelte';

  const language = { name: 'svelte', register: svelte(hljs) };

  let activeTabIndex = 0;

  $: _code = `<script>
  import Highlight from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import 'svelte-highlight/styles/${currentStyle}.css';
< /script>

<Highlight language={typescript}>
  {\`${code}\`}
</Highlight>`.replace(/< \//g, '</');

  $: _codeJavaScript = `<script>
  import Highlight from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import { ${currentStyle} } from 'svelte-highlight/styles';
< /script>

<svelte:head>
  {@html ${currentStyle}}
</svelte:head>

<Highlight language={typescript}>
  {\`${code}\`}
</Highlight>`.replace(/< \//g, '</');
</script>

<style>
  .container {
    display: inline-block;
    border: 2px solid #f4f4f4;
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
    {#each ['CSS Stylesheet', 'Injected JavaScript Styles'] as item, i (item)}
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
      <Highlight {language} code={_code} />
    {:else if activeTabIndex === 1}
      <Highlight {language} code={_codeJavaScript} />
    {/if}
  </div>
</section>
