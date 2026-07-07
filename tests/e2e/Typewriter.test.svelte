<script lang="ts">
  import Highlight, { Typewriter } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  export let speed = 1;

  let code = "const add = (a: number, b: number) => a + b;";
  let play = true;

  let done = 0;
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<button type="button" data-testid="toggle-play" on:click={() => (play = !play)}>
  {play ? "Pause" : "Play"}
</button>
<button
  type="button"
  data-testid="swap-code"
  on:click={() => (code = "function hello(name: string) {}")}
>
  Swap
</button>

<Highlight language={typescript} {code} let:highlighted>
  <Typewriter
    {highlighted}
    {speed}
    {play}
    data-testid="tw"
    on:done={() => (done += 1)}
  />
</Highlight>

<span data-testid="done">{done}</span>
