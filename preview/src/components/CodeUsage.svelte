<script>
  export let currentStyle = undefined;

  import { Highlight, HighlightSvelte } from "svelte-highlight";

  let activeTabIndex = 0;

  $: currentStyleCSS = (currentStyle || "")
    .split(/(?=[A-Z])/)
    .map(fragment => fragment.toLowerCase())
    .join("-");

  let code = "const add = (a: number, b: number) => a + b;";

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

  $: _code = `<script>
  import { Highlight } from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import 'svelte-highlight/styles/${currentStyleCSS}.css';

  $: code = \`${code}\`;
<\/script>

<Highlight language={typescript} {code} />`;
</script>

<style>
  .container {
    display: inline-block;
    min-width: 38rem;
    border: 2px solid #f4f4f4;
  }

  :global(code) {
    font-family: "Menlo", monospace;
    font-size: 0.75rem;
    line-height: 1.5;
  }

  :global(.hljs.hljs) {
    padding: 1rem 1.5rem 1rem 1.25rem;
  }

  ul {
    display: flex;
  }

  li {
    cursor: pointer;
  }

  p {
    margin-top: 0.5rem;
    max-width: 32rem;
    font-size: 0.875rem;
  }

  p a {
    color: #0f62fe;
  }
</style>

<section>
  <h2>Usage</h2>
  <ul role="tablist">
    {#each ['Injected Styles', 'CSS StyleSheet'] as item, i (item)}
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
  {#if activeTabIndex === 1}
    <p>
      <strong>NOTE:</strong>
      A CSS loader is required to import a CSS StyleSheet in a Svelte component.
      View an
      <a
        target="_blank"
        rel="noopener noreferre"
        href="https://github.com/metonym/svelte-highlight/tree/master/examples/webpack">
        example webpack set-up.
      </a>
    </p>
  {/if}
</section>
