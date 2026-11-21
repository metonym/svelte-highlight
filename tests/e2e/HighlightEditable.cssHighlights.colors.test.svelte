<script>
  import Highlight, {
    HighlightEditable,
    HighlightStyle,
  } from "svelte-highlight";
  import { BASE_CSS } from "svelte-highlight/themes/_base-css";
  import { samples } from "./color-samples.js";

  /**
   * Theme CSS or a `ThemePalette`.
   * @type {string | import("svelte-highlight/theme").ThemePalette}
   */
  export let theme;

  // Edits flow into the "dom" reference through `bind:code`.
  const codes = samples.map((sample) => sample.code);
</script>

<!-- Palettes need base.css. String themes never load it, so keep it out. -->
<svelte:head>
  {#if typeof theme === "object"}
    {@html `<style>${BASE_CSS}</style>`}
  {/if}
</svelte:head>

<HighlightStyle {theme}>
  {#each samples as sample, index}
    <div data-engine="dom" data-sample={index}>
      <Highlight language={sample.language} code={codes[index]} />
    </div>
    <div data-engine="css-highlights" data-sample={index}>
      <HighlightEditable
        language={sample.language}
        bind:code={codes[index]}
        engine="css-highlights"
        {theme}
      />
    </div>
  {/each}
</HighlightStyle>
