<script>
    export let name = "";
    export let moduleName = "";
  
    import HighlightAuto from "svelte-highlight/src/HighlightAuto.svelte";
    import * as styles from "svelte-highlight/src/styles";
  
    $: code = `<script>
  import { HighlightAuto } from "svelte-highlight";
  import ${moduleName} from "svelte-highlight/src/styles/${name}";
  
  const code = ".body { padding: 0; margin: 0; }";
<\/script>

<svelte:head>
  {@html ${moduleName}}
</svelte:head>

<HighlightAuto {code} />`;
  
    $: css = (styles[moduleName] || "")
      .replace(/\.hljs/g, `.${moduleName}.hljs`)
      .replace(/\.hljs /g, `.${moduleName}.hljs`)
      .replace(/\.hljs-/g, `.${moduleName} .hljs-`);
  </script>
  
  <svelte:head>
    {@html css}
  </svelte:head>
  
  <HighlightAuto class="{moduleName}" code="{code}" />
  