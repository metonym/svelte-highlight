<script>
  import { HighlightEditable } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  let first;
  let code = "ab";
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<div data-testid="first">
  <HighlightEditable bind:this={first} language={typescript} bind:code />
</div>
<div data-testid="second">
  <HighlightEditable language={typescript} bind:code />
</div>

<button
  type="button"
  data-testid="insert-first"
  on:click={() => first.insert("X")}
>
  insert into first
</button>
