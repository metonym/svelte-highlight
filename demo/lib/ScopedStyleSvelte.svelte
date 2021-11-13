<script>
  export let name = "";
  export let moduleName = "";

  import HighlightSvelte from "../../src/HighlightSvelte.svelte";
  import * as styles from "../../src/styles";

  $: code = `<script>
  import { HighlightSvelte } from "svelte-highlight";
  import ${moduleName} from "svelte-highlight/src/styles/${name}";
  
  const code = \`<button on:click={() => { console.log(0); }}>Click me</button>\`;
<\/script>

<svelte:head>
  {@html ${moduleName}}
</svelte:head>

<HighlightSvelte {code} />`;

  $: css = (styles[moduleName] || "")
    // prefix all styles with a scope
    .replace(/\.hljs/g, `.${moduleName} .hljs`)
    // adjust for first two rules being `code.hljs` not `.hljs`
    .replace(/\s?code\.[_0-9a-zA-Z]+\s\.hljs/g, `.${moduleName} code.hljs`);
</script>

<svelte:head>
  {@html css}
</svelte:head>

<HighlightSvelte class={moduleName} {code} />
