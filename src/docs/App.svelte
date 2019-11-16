<script>
  import Highlight from '../Highlight.svelte';
  import { onMount } from 'svelte';

  const code = [
    'function add(a: number, b: number) {',
    '  return a + b;',
    '}\n',
    'const sum = add(1, 2);'
  ].join('\n')

  let currentStyle;
  let languages = {};
  let styles = {};
  let language;
  let style;

  onMount(async () => {
    languages = await import('../languages');
    language = languages.typescript;

    styles = await import('../styles');
    style = styles.a11yLight;
    currentStyle = 'a11yLight';
  });

  $: loaded = language && style;
  $: supportedStyles = Object.keys(styles);
  $: {
    if (styles && currentStyle) {
      style = styles[currentStyle];
    }
  }
</script>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html) {
    font-size: 16px;
    line-height: 1.4;
  }

  @media (max-width: 1080px) {
		:global(html) {
      font-size: 14px;
    }
	}

  @media (max-width: 960px) {
		:global(html) {
      font-size: 12px;
    }
	}

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
      'Open Sans', 'Helvetica Neue', sans-serif;
    letter-spacing: 0.01rem;
  }

  :global(code) {
    font-family: Consolas, Menlo, monospace;
  }

  :global(.svelte-highlight).hljs {
    padding: 1rem 1.25rem;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
  }

  .root {
    display: flex;
  }

  h1,
  h3 {
    font-size: 1.25rem;
    margin-left: 1.25rem;
    margin-bottom: 1rem;
  }

  main {
    position: absolute;
    top: 0;
    right: 0;
    width: calc(100% - 16rem);
    height: 100vh;
    display: flex;
    flex-direction: column;
    margin-left: 16rem;
    padding: 1rem 2rem;
    overflow: auto;
  }

  section {
    margin-bottom: 2.5rem;
  }

  button {
    outline: 0;
    border: 0;
    background: none;
    font: inherit;
    color: inherit;
    letter-spacing: inherit;
    cursor: pointer;
    width: 100%;
    height: 100%;
    padding: 0.5rem 1rem;
    text-align: left;
  }

  button:focus {
    color: #0f62fe;
  }

  ul {
    position: fixed;
    top: 0;
    left: 0;
    width: 16rem;
    height: 100vh;
    overflow-y: scroll;
    padding: 1rem 0;
  }

  li {
    list-style: none;
    display: flex;
    align-items: flex-start;
    border-left: 0.25rem solid transparent;
  }

  li:hover {
    background-color: #f4f4f4;
  }

  li.active {
    color: #0f62fe;
    background-color: #f4f4f4;
  }

  li.active {
    border-left-color: #0f62fe;
  }

  .pre {
    padding: 1rem 1.25rem;
    cursor: text;
  }

  .container {
    display: inline-block;
  }
</style>

<svelte:head>
  {@html style}
</svelte:head>

<div class="root">
  <ul>
    <h3>Themes</h3>
    {#each supportedStyles as style, i (style)}
      <li class:active={currentStyle === style}>
        <button
          type="button"
          on:click={() => {
            currentStyle = style;
          }}>
          {style}
        </button>
      </li>
    {/each}
  </ul>

  <main>
    <section>
      <h1>Preview</h1>
      {#if loaded}
        <div class="container">
          <Highlight {language}>
            {`${code}`}
          </Highlight>
        </div>
      {/if}
    </section>

    <section>
      <h1>Usage</h1>
      <pre class="pre"><code>{`<script>
  import Highlight from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import 'svelte-highlight/styles/${currentStyle}.css';
</script>

<Highlight language={typescript}>
  {${'`' + code + '`'}}
</Highlight>`}</code></pre>
    </section>
  </main>
</div>
