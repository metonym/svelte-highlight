<script>
  import Highlight from "svelte-highlight";
  import { toRanges } from "svelte-highlight/engine";
  import javascript from "svelte-highlight/languages/javascript";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";
  import atomOneDark from "svelte-highlight/themes/atom-one-dark";

  const codeA = "const a = 1;";
  const codeB = "const b = 2;";

  let code = codeA;
  let language = typescript;
  let theme = github;

  let instance;
  $: resolvedEngine = instance?.resolvedEngine();

  /** @type {import("svelte-highlight/engine").ScopeEvent[]} */
  let events = [];
  $: expectedRangesJson = JSON.stringify(toRanges(events));
</script>

<Highlight
  bind:this={instance}
  {language}
  {code}
  engine="css-highlights"
  {theme}
  on:highlight={(e) => (events = e.detail.events)}
/>

<div data-testid="resolved-engine" data-value={resolvedEngine}></div>
<div data-testid="expected-ranges" data-value={expectedRangesJson}></div>

<button
  type="button"
  data-testid="toggle-code"
  on:click={() => (code = code === codeA ? codeB : codeA)}
>
  toggle code
</button>
<button
  type="button"
  data-testid="switch-language"
  on:click={() => (language = javascript)}
>
  switch language
</button>
<button
  type="button"
  data-testid="switch-theme"
  on:click={() => (theme = atomOneDark)}
>
  switch theme
</button>
