<script>
  export let name = "";
  export let moduleName = "";
  export let useInjectedStyles = true;
  export let useCdnImport = false;

  import HighlightSvelte from "../../src/HighlightSvelte.svelte";
  import * as styles from "../../src/styles";

  $: importStyles = useInjectedStyles
    ? `import ${moduleName} from "svelte-highlight/styles/${name}";`
    : `import "svelte-highlight/styles/${name}.css";`;
  $: code = `<script>
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  ${!useInjectedStyles && useCdnImport ? "" : importStyles + "\n"}
  const code = "const add = (a: number, b: number) => a + b;";
<\/script>
${
  useInjectedStyles || useCdnImport
    ? `\n<svelte:head>
  ${
    useInjectedStyles
      ? `{@html ${moduleName}}`
      : `<link
    rel="stylesheet"
    href="https://unpkg.com/svelte-highlight/styles/${name}.css"
  />`
  }
</svelte:head>\n`
    : ""
}
<Highlight language={typescript} {code} />`;

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
