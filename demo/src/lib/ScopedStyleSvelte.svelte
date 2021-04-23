<script>
  export let name = "";
  export let moduleName = "";

  import HighlightSvelte from "svelte-highlight/src/HighlightSvelte.svelte";
  import * as styles from "svelte-highlight/src/styles";

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
    .replace(/\.hljs/g, `.${moduleName}.hljs`)
    .replace(/\.hljs /g, `.${moduleName}.hljs`)
    .replace(/\.hljs-/g, `.${moduleName} .hljs-`);
</script>

<svelte:head>
  {@html css}
</svelte:head>

<HighlightSvelte class="{moduleName}" code="{code}" />
