<script>
  import { MarkdownStream } from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  // Chunk boundaries land mid-fence and mid-line, exercising the same
  // arbitrary-boundary handling as HighlightStream itself.
  const CHUNKS = [
    "Here is a reply.\n\n```ts\nconst a: number = 1;\n```\n\n",
    "And a script.\n\n```py\n",
    'print("hi")\n```\n',
  ];

  let text = "";
  let done = false;
  let chunksSent = 0;
  let fenceCount = 0;
  let doneCount = 0;

  function appendChunk() {
    if (chunksSent >= CHUNKS.length) return;
    text += CHUNKS[chunksSent];
    chunksSent += 1;
  }

  // Simulates an LLM "regenerate the last fence": edits only the trailing
  // fence's code, not a pure append - the splitter's `set` path.
  function regenerateLastFence() {
    text = text.replace('print("hi")', 'print("hello, world")');
  }

  function finish() {
    done = true;
  }

  function startUnknownLanguage() {
    text = "```nope\ncustom text\n```\n";
    done = false;
    chunksSent = CHUNKS.length;
  }

  // A finished buffer in one assignment -- no later `text` change to
  // accidentally re-evaluate the fence language after the grammar loads.
  function startCompleteFence() {
    text = [
      "Here's a helper that adds two numbers:",
      "",
      "```javascript",
      "function add(a, b) {",
      "  return a + b;",
      "}",
      "```",
      "",
    ].join("\n");
    done = true;
    chunksSent = CHUNKS.length;
  }
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<button type="button" data-testid="append-chunk" on:click={appendChunk}>
  Append chunk
</button>
<button type="button" data-testid="regenerate" on:click={regenerateLastFence}>
  Regenerate last fence
</button>
<button type="button" data-testid="finish" on:click={finish}>Finish</button>
<button
  type="button"
  data-testid="start-unknown"
  on:click={startUnknownLanguage}
>
  Start unknown language
</button>
<button
  type="button"
  data-testid="start-complete"
  on:click={startCompleteFence}
>
  Start complete fence
</button>

<MarkdownStream
  {text}
  {done}
  data-testid="markdown-stream"
  on:fence={() => (fenceCount += 1)}
  on:done={() => (doneCount += 1)}
/>

<span data-testid="fence-count">{fenceCount}</span>
<span data-testid="done-count">{doneCount}</span>
