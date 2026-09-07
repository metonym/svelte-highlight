<script lang="ts">
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const code = "const add = (a: number, b: number) => a + b;";

  let langtag = false;
  let dispatchCount = 0;
</script>

<button type="button" on:click={() => (langtag = !langtag)}>
  Toggle langtag
</button>

<Highlight
  {langtag}
  language={typescript}
  {code}
  on:highlight={() => dispatchCount++}
/>

<p data-testid="dispatch-count">{dispatchCount}</p>
