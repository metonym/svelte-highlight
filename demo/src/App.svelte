<script>
  import HighlightLegacy, {
    Highlight,
    HighlightSvelte
  } from "svelte-highlight";
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

<style>
  :global(code) {
    font-family: "Menlo", monospace;
  }
</style>

<svelte:head>
  {@html solarizedDark}
</svelte:head>
Legacy:
<HighlightLegacy language={typescript}>{code_typescript}</HighlightLegacy>
Highlight
<Highlight
  on:click={() => {
    console.log('click');
  }}
  on:select={() => {
    console.log('on:select');
  }}
  on:highlight={() => {
    console.log('on:highlight', 'default');
  }}
  language={typescript}
  code={code_typescript} />
HighlightSvelte
<HighlightSvelte
  {code}
  on:click={() => {
    console.log('click');
  }}
  on:select={() => {
    console.log('on:select');
  }}
  on:highlight={() => {
    console.log('on:highlight', 'svelte');
  }} />
