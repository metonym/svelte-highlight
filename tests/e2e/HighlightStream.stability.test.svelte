<script>
  import { HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  let code = "const a = 1;";

  function appendLines() {
    let extra = "";
    for (let i = 0; i < 50; i++) extra += `\nconst x${i} = ${i};`;
    code += extra;
  }
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<button type="button" data-testid="append-lines" on:click={appendLines}>
  Append 50 lines
</button>

<HighlightStream language={javascript} {code} data-testid="stream" />
