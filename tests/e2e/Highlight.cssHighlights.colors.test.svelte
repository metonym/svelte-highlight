<script>
  import Highlight, { HighlightStyle } from "svelte-highlight";
  import { BASE_CSS } from "svelte-highlight/themes/_base-css";
  import { samples } from "./color-samples.js";

  /**
   * Theme CSS or a `ThemePalette`.
   * @type {string | import("svelte-highlight/theme").ThemePalette}
   */
  export let theme;
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
      <Highlight language={sample.language} code={sample.code} />
    </div>
    <div data-engine="css-highlights" data-sample={index}>
      <Highlight
        language={sample.language}
        code={sample.code}
        engine="css-highlights"
        {theme}
      />
    </div>
  {/each}
</HighlightStyle>
