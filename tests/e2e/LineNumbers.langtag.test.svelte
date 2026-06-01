<script lang="ts">
  import Highlight, { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = "const add = (a: number, b: number) => a + b";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<Highlight
  language={typescript}
  {code}
  langtag
  let:highlighted
  let:langtag
  let:languageName
>
  <LineNumbers {highlighted} {langtag} {languageName} />
</Highlight>
