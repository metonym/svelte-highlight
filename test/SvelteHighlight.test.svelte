<script lang="ts">
  import Highlight, { HighlightAuto, HighlightSvelte } from "../types";
  import Highlight2 from "../types/Highlight.svelte";
  import { typescript } from "../types/src/languages";
  import javascript from "../types/src/languages/javascript";
  import { github, purebasic, _3024 } from "../types/src/styles";
  import "svelte-highlight/styles/github.css";

  let toggled = true;

  $: code = "const add = (a: number, b: number) => a + b;";
  $: codeSvelte = "<button on:click>Click me</button>";
</script>

<svelte:head>
  {@html github}
  {@html purebasic}
  {@html _3024}
</svelte:head>

<HighlightAuto code="{toggled ? code : codeSvelte}" langtag="{true}" />

<Highlight
  language="{toggled ? javascript : typescript}"
  code="{code}"
  langtag="{true}"
  on:highlight="{(e) => {
    console.log(e.detail.highlighted);
  }}"
  let:highlighted
>
  {@html highlighted}
</Highlight>

<HighlightSvelte code="{codeSvelte}" langtag="{true}" on:highlight />

<Highlight2 code="123" />