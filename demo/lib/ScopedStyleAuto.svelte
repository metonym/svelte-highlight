<script>
  // @ts-check
  export let name = "";
  export let moduleName = "";

  import HighlightAuto from "../../src/HighlightAuto.svelte";
  import * as styles from "../../src/styles";

  $: code = `<script>
  import { HighlightAuto } from "svelte-highlight";
  import ${moduleName} from "svelte-highlight/styles/${name}";
  
  const code = ".body { padding: 0; margin: 0; }";
<\/script>

<svelte:head>
  {@html ${moduleName}}
</svelte:head>

<HighlightAuto {code} />`;

  $: css = (styles[moduleName] || "")
    // prefix all styles with a scope
    .replace(/\.hljs/g, `.${moduleName} .hljs`)
    // adjust for first two rules being `code.hljs` not `.hljs`
    .replace(/\s?code\.[_0-9a-zA-Z]+\s\.hljs/g, `.${moduleName} code.hljs`);
</script>

<svelte:head>
  {@html css}
</svelte:head>

<HighlightAuto class={moduleName} {code} />
