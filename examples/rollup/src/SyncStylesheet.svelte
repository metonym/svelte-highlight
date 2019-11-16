<script>
  import Highlight from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import 'svelte-highlight/styles/github.css';
</script>

<Highlight language={typescript}>
  {`function add(a: number, b: number) {
  return a + b;
}

const sum = add(1, 2);`}
</Highlight>
