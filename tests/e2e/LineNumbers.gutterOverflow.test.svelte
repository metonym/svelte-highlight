<script lang="ts">
  import Highlight, { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import horizonDark from "svelte-highlight/styles/horizon-dark";

  const code = `const a = 1;
const b = 2;
const c = 3;`;
</script>

<svelte:head> {@html horizonDark} </svelte:head>

<div data-testid="small">
  <Highlight language={typescript} {code} let:highlighted>
    <LineNumbers {highlighted} startingLineNumber={999} />
  </Highlight>
</div>

<div data-testid="large">
  <Highlight language={typescript} {code} let:highlighted>
    <LineNumbers {highlighted} startingLineNumber={99_999} />
  </Highlight>
</div>
