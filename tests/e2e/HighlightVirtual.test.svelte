<script>
  import { HighlightVirtual } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  export const LINE_COUNT = 5000;

  function generateCode(lines) {
    let out = "";
    for (let i = 0; i < lines; i++) out += `const x${i} = ${i}; // line ${i}\n`;
    return out;
  }

  export let code = generateCode(LINE_COUNT);
  export let overscan = 5;
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<HighlightVirtual
  language={javascript}
  {code}
  {overscan}
  data-testid="virtual"
  style="height: 300px; width: 600px;"
  {...$$restProps}
/>
