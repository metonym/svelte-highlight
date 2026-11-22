<script>
  import { defineHighlightElement } from "svelte-highlight/element.js";

  defineHighlightElement();

  let code = "def add(a, b): return a + b";
  let language = "python";
  let lastEvent = "";
</script>

<shl-code data-testid="authored" language="typescript">
  const add = (a, b) => a + b;
</shl-code>

<shl-code
  data-testid="dynamic"
  {language}
  {code}
  on:highlighted={(e) => (lastEvent = `highlighted ${e.detail.language}`)}
  on:error={() => (lastEvent = "error")}
></shl-code>

<button type="button" on:click={() => (code = "fn main() {}")}>code</button>
<button type="button" on:click={() => (language = "rust")}>rust</button>
<button type="button" on:click={() => (language = "not-a-language")}
  >unknown</button
>
<p data-testid="last-event">{lastEvent}</p>
