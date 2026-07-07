<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import { HighlightStream } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";

  // Chunk 1 opens a backtick string spanning two lines, left unterminated.
  // Chunk 2 closes it and appends a trailing line.
  const chunk1 = "const s = `line one\nline two";
  const chunk2 = " done`;\nconsole.log(s);";

  let code = chunk1;
  let closed = false;

  function close() {
    code += chunk2;
    closed = true;
  }

  function reset() {
    code = chunk1;
    closed = false;
  }
</script>

<p class="label-01 mb-3">
  The template literal opened on line 0 is still unterminated—line 1 renders
  fully inside the string span. Closing it re-tokenizes line 1 in place: the
  string span now ends before the semicolon, with no special-casing in the
  component.
</p>

<HighlightStream language={javascript} {code} class={THEME_MODULE_NAME} />

<div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.75rem">
  <Button size="small" kind="tertiary" disabled={closed} on:click={close}>
    Close the template literal
  </Button>
  <Button size="small" kind="ghost" on:click={reset}>Reset</Button>
</div>
