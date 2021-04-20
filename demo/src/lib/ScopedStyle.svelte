<script>
  export let style = "";

  import HighlightSvelte from "svelte-highlight/src/HighlightSvelte.svelte";
  import * as styles from "svelte-highlight/src/styles";

  $: code = `<script>
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/src/languages/typescript";
  import ${style} from "svelte-highlight/src/styles/${style}";

  const code = "const add = (a: number, b: number) => a + b;";
<\/script>

<svelte:head>
  {@html ${style}}
</svelte:head>

<Highlight language={typescript} {code} />`;

  $: css = (styles[style] || "")
    .replace(/\.hljs/g, `.${style}.hljs`)
    .replace(/\.hljs /g, `.${style}.hljs`)
    .replace(/\.hljs-/g, `.${style} .hljs-`);
</script>

<svelte:head>
  {@html css}
</svelte:head>

<HighlightSvelte class="{style}" code="{code}" />
