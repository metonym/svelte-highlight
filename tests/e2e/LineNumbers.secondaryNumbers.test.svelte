<script lang="ts">
  import Highlight, { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import horizonDark from "svelte-highlight/styles/horizon-dark";

  const code = `const a = 1;
const b = 2;
const c = 3;
const d = 4;
const e = 5;`;
</script>

<svelte:head> {@html horizonDark} </svelte:head>

<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers
    {highlighted}
    numbers={[10, null, 12, 13, null]}
    secondaryNumbers={[1, 2, null, null, 5]}
  />
</Highlight>
