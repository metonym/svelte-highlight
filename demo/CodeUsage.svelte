<script>
  export let currentStyle = undefined;
  export let code = undefined;

  import Highlight from '../src/Highlight.svelte';
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
    border: 1px solid #f4f4f4;
  }

  :global(.highlight.hljs) {
    padding: 1rem 1.25rem;
  }

  ul {
    display: flex;
    list-style: none;
  }

  li {
    letter-spacing: 0.03rem;
    cursor: pointer;
  }

  li:hover {
    background-color: #f4f4f4;
  }

  button {
    width: 100%;
    height: 100%;
    padding: 0.5rem 1.25rem;
  }

  .active {
    background-color: #f4f4f4;
    color: #0f62fe;
  }
</style>

<section>
  <h2>Usage</h2>
  <ul role="tablist">
    {#each ['CSS Loader', 'JavaScript Styles'] as item, i (item)}
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
      <Highlight {language} code={_code} className="highlight" />
    {:else if activeTabIndex === 1}
      <Highlight {language} code={_codeJavaScript} className="highlight" />
    {/if}
  </div>
</section>
