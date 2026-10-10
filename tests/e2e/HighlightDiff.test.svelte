<script>
  import { HighlightDiff } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  /** Lines in the large document. */
  export let lineCount = 40;
  export let review = false;
  export let wrap = false;
  /** @type {"auto" | boolean} */
  export let virtualize = "auto";
  /** Make line 10 long enough to wrap. */
  export let longLine = false;

  function generate(n) {
    let out = "";
    for (let i = 0; i < n; i++) out += `const x${i} = ${i}; // line ${i}\n`;
    return out;
  }

  const before = generate(lineCount);
  const long = `const x10 = [${Array.from({ length: 200 }, (_, i) => i).join(", ")}];`;
  const after = (longLine ? before.replace("const x10 = 10;", long) : before)
    .replace("const x5 = 5;", "const x5 = 500;")
    .replace(
      `const x${lineCount - 5} = ${lineCount - 5};`,
      "const changed = true;",
    );

  /** @type {"unified" | "split"} */
  let view = "unified";
  let reviewText = "";
  let navigate = "";

  // Streaming: grows `streamed` one line at a time.
  let streamed = "";
  let streaming = false;
  let streamDone = false;
  function streamLine() {
    streaming = true;
    const lines = after.split("\n");
    const have = streamed.split("\n").length - 1;
    streamed = `${lines.slice(0, have + 1).join("\n")}\n`;
  }
  function finishStream() {
    streamed = after;
    streaming = false;
    streamDone = true;
  }
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<HighlightDiff
  data-testid="diff"
  {before}
  {after}
  language={javascript}
  {review}
  {wrap}
  {virtualize}
  bind:view
  style="height: 300px"
  on:review={(e) => (reviewText = e.detail.text)}
  on:navigate={(e) => (navigate = `${e.detail.index + 1}/${e.detail.count}`)}
/>
<div data-testid="view">{view}</div>
<div data-testid="navigate">{navigate}</div>
<pre data-testid="review-text">{reviewText}</pre>

<button type="button" data-testid="stream-line" on:click={streamLine}>
  stream
</button>
<button type="button" data-testid="stream-finish" on:click={finishStream}>
  finish
</button>
{#if streaming || streamDone}
  <HighlightDiff
    data-testid="stream"
    {before}
    after={streamed}
    {streaming}
    follow={false}
    language={javascript}
    style="height: 300px"
  />
{/if}
