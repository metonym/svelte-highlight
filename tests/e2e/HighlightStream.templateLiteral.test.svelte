<script>
  import { HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  // Chunk 1 opens a backtick string that spans two lines, unterminated.
  // Chunk 2 closes it and appends a trailing line.
  const chunk1 = "const s = `line one\nline two";
  const chunk2 = " done`;\nconsole.log(s);";

  let code = chunk1;

  function closeTemplateLiteral() {
    code += chunk2;
  }
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<button
  type="button"
  data-testid="close-template-literal"
  on:click={closeTemplateLiteral}
>
  Close template literal
</button>

<HighlightStream language={javascript} {code} data-testid="stream" />
