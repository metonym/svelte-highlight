<script lang="ts">
  import Highlight, { Typewriter } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  export let speed = 1;

  const code = "const add = (a: number, b: number) => a + b;";

  let done = 0;
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<Highlight language={typescript} {code} let:highlighted>
  <Typewriter
    {highlighted}
    {speed}
    data-testid="tw"
    on:done={() => (done += 1)}
  />
</Highlight>

<span data-testid="done">{done}</span>
