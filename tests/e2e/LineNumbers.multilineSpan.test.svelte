<script lang="ts">
  import Highlight, { LineNumbers } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import horizonDark from "svelte-highlight/styles/horizon-dark";

  const code = `/* line1
line2
line3 */`;
</script>

<svelte:head> {@html horizonDark} </svelte:head>

<Highlight language={javascript} {code} let:highlighted>
  <LineNumbers {highlighted} />
</Highlight>
