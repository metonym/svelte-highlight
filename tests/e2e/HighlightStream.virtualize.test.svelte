<script>
  import { HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  export let overscan = 5;
  export let autoScroll = false;

  let code = "";
  let done = false;
  let doneCount = 0;

  function appendLines(n) {
    let extra = "";
    for (let i = 0; i < n; i++) extra += `const x${i} = ${i}; // line ${i}\n`;
    code += extra;
  }

  function appendMany() {
    appendLines(2000);
  }

  function appendFew() {
    appendLines(3);
  }

  function finish() {
    done = true;
  }
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<button type="button" data-testid="append-many" on:click={appendMany}>
  Append 2000 lines
</button>
<button type="button" data-testid="append-few" on:click={appendFew}>
  Append 3 lines
</button>
<button type="button" data-testid="finish" on:click={finish}>Finish</button>
<span data-testid="done-count">{doneCount}</span>

<HighlightStream
  language={javascript}
  {code}
  {done}
  {autoScroll}
  virtualize
  {overscan}
  data-testid="stream"
  style="height: 300px; width: 600px;"
  on:done={() => (doneCount += 1)}
/>
