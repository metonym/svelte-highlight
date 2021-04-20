<script lang="ts">
  import Highlight, { HighlightAuto, HighlightSvelte } from "../types";
  import { typescript, cpp } from "../types/src/languages";
  import javascript from "../types/src/languages/javascript";
  import { github, purebasic } from "../types/src/styles";
  import "svelte-highlight/styles/github.css";

  $: code = `const add = (a: number, b: number) => a + b;`;
  $: codeSvelte = `<script>
  let count = 0;
<\/script>

<button on:click="{() => { count += 1; }}">Click me<\/button>`;
</script>

<svelte:head>
  {@html github}
  {@html purebasic}
</svelte:head>

<HighlightAuto code="" />

<Highlight
  language="{typescript}"
  code="{code}"
  on:highlight="{(e) => {
    console.log(e.detail.highlighted);
  }}"
  let:highlighted
>
  {@html highlighted}
</Highlight>

<HighlightSvelte code="{codeSvelte}" on:highlight />
