<script>
  export let name = "";
  export let moduleName = "";
  export let useInjectedStyles = true;

  import HighlightSvelte from "svelte-highlight/src/HighlightSvelte.svelte";
  import * as styles from "svelte-highlight/src/styles";

  $: code = `<script>
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/src/languages/typescript";
  ${
    useInjectedStyles
      ? `import ${moduleName} from "svelte-highlight/src/styles/${name}";`
      : `import "svelte-highlight/src/styles/${name}.css";`
  }

  const code = "const add = (a: number, b: number) => a + b;";
<\/script>
${
  useInjectedStyles
    ? `\n<svelte:head>
  {@html ${moduleName}}
</svelte:head>\n`
    : ""
}
<Highlight language={typescript} {code} />`;

  $: css = (styles[moduleName] || "")
    .replace(/\.hljs/g, `.${moduleName}.hljs`)
    .replace(/\.hljs /g, `.${moduleName}.hljs`)
    .replace(/\.hljs-/g, `.${moduleName} .hljs-`);
</script>

<svelte:head>
  {@html css}
</svelte:head>

<HighlightSvelte class="{moduleName}" code="{code}" />
