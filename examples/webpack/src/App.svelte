<script>
  import Highlight from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import 'svelte-highlight/styles/github.css';
</script>

<Highlight language={typescript}>const a: number = 4;</Highlight>
