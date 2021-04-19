<script lang="ts">
  import Legacy, { Highlight, HighlightSvelte } from "../types";
  import { typescript, cpp } from "../types/src/languages";
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

<Legacy code="" contenteditable="false" language="{cpp}" />

<Highlight
  language="{typescript}"
  code="{code}"
  on:highlight="{(e) => {
    console.log(e.detail.highlighted);
  }}"
  on:click
  on:mouseover
  on:mouseenter
  on:mouseleave
  on:focus
  on:blur
  let:highlighted
>
  {@html highlighted}
</Highlight>

<HighlightSvelte
  code="{codeSvelte}"
  on:click
  on:mouseover
  on:mouseenter
  on:mouseleave
  on:focus
  on:blur
  on:highlight
/>
