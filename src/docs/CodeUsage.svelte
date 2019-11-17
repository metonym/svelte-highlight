<script>
  export let currentStyle;
  export let code;

  let text;

  $: preview = [
    '<script>',
    "  import Highlight from 'svelte-highlight';",
    "  import { typescript } from 'svelte-highlight/languages';",
    `  import 'svelte-highlight/styles/${currentStyle}.css';`,
    '< /script>\n',
    '<Highlight language={typescript}>',
    `  {${'`' + code + '`'}}`,
    '</Highlight>'
  ]
    .join('\n')
    .replace(/< \//g, '</');

  $: [first, second] = preview.split(currentStyle);
</script>

<style>
  pre {
    display: inline-block;
    padding: 1rem 1.25rem;
    background-color: #f4f4f4;
    cursor: text;
  }
</style>

<section>
  <h2>Usage</h2>
  <pre>
    <code>{first}<strong>{currentStyle}</strong>{second}</code>
  </pre>
</section>
