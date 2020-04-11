<script>
  import Highlight, { HighlightSvelte } from "svelte-highlight";
  import { typescript } from "svelte-highlight/languages";
  import { solarizedDark } from "svelte-highlight/styles";

  let code_typescript = `function add(a: number, b: number) {
  return a + b;
}

const sum = add(1, 2);`;

  let code = `<script>
  import { HighlightSvelte } from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import 'svelte-highlight/styles/solarizedDark.css';
<\/script>

<Highlight language={typescript}>
  {'function add(a: number, b: number) {
  return a + b;
}

const sum = add(1, 2);'}
</Highlight>`;
</script>

<svelte:head>
  {@html solarizedDark}
</svelte:head>

<Highlight code={code_typescript} language={typescript} />

<HighlightSvelte {code} />
