<script>
  import { HighlightEditable } from "svelte-highlight";
  import plaintext from "svelte-highlight/languages/plaintext";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  let language = plaintext;
  let code = "const x: number = 1;";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<HighlightEditable {language} bind:code />

<button
  type="button"
  data-testid="switch-language"
  on:click={() => (language = typescript)}
>
  switch language
</button>
