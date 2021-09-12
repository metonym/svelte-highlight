<script lang="ts">
  import Highlight, { HighlightAuto, HighlightSvelte } from "../types";
  import { typescript } from "../types/src/languages";
  import javascript from "../types/src/languages/javascript";
  import { github, purebasic, _3024 } from "../types/src/styles";
  import "svelte-highlight/styles/github.css";

  let toggled = true;

  $: code = "const add = (a: number, b: number) => a + b;";
  $: codeSvelte = "<button on:click>Click me</button>";
</script>

<svelte:head>
  <!-- svelte-ignore missing-declaration -->
  {@html github}
  <!-- svelte-ignore missing-declaration -->
  {@html purebasic}
  <!-- svelte-ignore missing-declaration -->
  {@html _3024}
</svelte:head>

<!-- svelte-ignore missing-declaration -->
<HighlightAuto code="{toggled ? code : codeSvelte}" langtag="{true}" />

<!-- svelte-ignore missing-declaration -->
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

<!-- svelte-ignore missing-declaration -->
<HighlightSvelte code="{codeSvelte}" langtag="{true}" on:highlight />
