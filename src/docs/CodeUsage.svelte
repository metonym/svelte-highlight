<script>
  export let currentStyle;
  export let code;

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
</script>

<section>
  <h1>Usage</h1>
  <pre class="pre">
    <code>{preview}</code>
  </pre>
</section>
