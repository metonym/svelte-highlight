<script>
  import Highlight from "svelte-highlight";
  import {
    cascadeRanges,
    createThemeCascade,
  } from "svelte-highlight/highlight-cascade";
  import javascript from "svelte-highlight/languages/javascript";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";
  import atomOneDark from "svelte-highlight/themes/atom-one-dark";

  export let code = "const a = 1;";

  let language = typescript;
  let theme = github;
  /** @type {"dom" | "css-highlights"} */
  let engine = "css-highlights";

  let instance;
  /** @type {string | undefined} */
  let resolvedEngine;
  /** @type {import("svelte-highlight/engine").ScopeEvent[]} */
  let events = [];
  $: expectedRanges = JSON.stringify(
    cascadeRanges(events, createThemeCascade(theme)).ranges,
  );
</script>

<Highlight
  bind:this={instance}
  {language}
  {code}
  {engine}
  {theme}
  on:highlight={(e) => (events = e.detail.events)}
/>

<div data-testid="resolved-engine" data-value={resolvedEngine}></div>
<div data-testid="expected-ranges" data-value={expectedRanges}></div>

<button
  type="button"
  on:click={() => (resolvedEngine = instance?.resolvedEngine())}
>
  read engine
</button>
<button type="button" on:click={() => (code = "let b = 'two';")}>
  set code
</button>
<button type="button" on:click={() => (language = javascript)}>
  set language
</button>
<button type="button" on:click={() => (theme = atomOneDark)}>set theme</button>
<button
  type="button"
  on:click={() => (engine = engine === "dom" ? "css-highlights" : "dom")}
>
  toggle engine
</button>
