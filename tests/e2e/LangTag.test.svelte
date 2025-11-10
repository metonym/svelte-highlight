<script lang="ts">
  import hljs from "highlight.js/lib/core";
  import typescript from "highlight.js/lib/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  import LangTag from "../../src/LangTag.svelte";

  hljs.registerLanguage("typescript", typescript);

  const code = "const add = (a: number, b: number) => a + b;";
  const highlighted = hljs.highlight(code, { language: "typescript" }).value;
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<LangTag {code} {highlighted} languageName="typescript" langtag />
