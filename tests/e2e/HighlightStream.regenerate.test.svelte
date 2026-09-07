<script>
  import Highlight, { HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  let code = "";
  let highlighted = "";
  let referenceHighlighted = "";

  function appendChunk1() {
    code += "const a = 1;\n";
  }
  function appendChunk2() {
    code += "const b = 2;\n";
  }
  function appendChunk3() {
    code += "const c = 3;\n";
  }

  // Simulates an LLM "regenerate the last paragraph": edits a line that
  // isn't at the current end, not just appends - the non-append path that
  // forces HighlightStream to patch the session with `replace()` instead of
  // restarting it.
  function regenerateEarlierLine() {
    code = code.replace("const b = 2;", "const b = 222;");
  }
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<button type="button" data-testid="append-1" on:click={appendChunk1}>
  Append 1
</button>
<button type="button" data-testid="append-2" on:click={appendChunk2}>
  Append 2
</button>
<button type="button" data-testid="append-3" on:click={appendChunk3}>
  Append 3
</button>
<button type="button" data-testid="regenerate" on:click={regenerateEarlierLine}>
  Regenerate earlier line
</button>

<HighlightStream
  language={javascript}
  {code}
  data-testid="stream"
  on:highlight={(e) => {
    highlighted = e.detail.highlighted;
  }}
/>

<pre data-testid="highlighted-snapshot" style="display:none">{highlighted}</pre>
<pre
  data-testid="reference-highlighted-snapshot"
  style="display:none"
>{referenceHighlighted}</pre>

<Highlight
  language={javascript}
  {code}
  data-testid="reference"
  on:highlight={(e) => {
    referenceHighlighted = e.detail.highlighted;
  }}
/>
