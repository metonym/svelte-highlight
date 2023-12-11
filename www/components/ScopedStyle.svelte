<script>
  // @ts-check

  export let name = "";
  export let moduleName = "";
  export let useInjectedStyles = true;
  export let useCdnImport = false;

  import HighlightSvelte from "svelte-highlight/HighlightSvelte.svelte";

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
</script>

<HighlightSvelte class={moduleName} {code} />
