<script lang="ts">
  import Highlight, { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import horizonDark from "svelte-highlight/styles/horizon-dark";

  const code = "const add = (a: number, b: number) => a + b";
</script>

<svelte:head>
  {@html horizonDark}
</svelte:head>

<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers {highlighted} startingLineNumber={100} />
</Highlight>
