<script>
  export let currentStyle = undefined;
  export let code = undefined;

  import Highlight from '../Highlight.svelte';
  import language from '../languages/xml';

  $: _code = `<script>
  import Highlight from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import 'svelte-highlight/styles/${currentStyle}.css';
< /script>

<Highlight language={typescript}>
  {\`${code}\`}
</Highlight>`.replace(/< \//g, '</');
</script>

<style>
  .container {
    display: inline-block;
  }

  :global(.highlight.hljs) {
    padding: 1rem 1.25rem;
  }
</style>

<section>
  <h2>Usage</h2>
  <div class="container">
    <Highlight {language} code={_code} className="highlight" />
  </div>
</section>
