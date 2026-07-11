<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import Highlight, { HighlightStyle, HighlightSvelte } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/themes/atom-one-dark";
  import "svelte-highlight/themes/base.css";
  import { defineTheme, extendTheme } from "svelte-highlight/theme";

  const code = `interface User {
  id: number;
  name: string;
}

const greet = (user: User): string => {
  // Say hello
  return \`Hello, \${user.name}!\`;
};`;

  const modes = ["defineTheme", "extendTheme"];

  /** @type {"defineTheme" | "extendTheme"} */
  let mode = "defineTheme";

  let background = "#0b1021";
  let foreground = "#d6deeb";
  let comment = "#637777";
  let keyword = "#c792ea";
  let string = "#ecc48d";
  let fn = "#82aaff";
  let type = "#ffcb8b";
  let tag = "#7fdbca";

  $: customTheme = defineTheme({
    name: "midnight",
    roles: {
      background,
      foreground,
      comment: { color: comment, fontStyle: "italic" },
      keyword,
      string,
      function: fn,
      type,
      tag,
    },
  });

  $: brandedTheme = extendTheme(atomOneDark, {
    name: "atom-one-dark-branded",
    roles: { keyword },
  });

  $: theme = mode === "defineTheme" ? customTheme : brandedTheme;

  const snippet = `<script>
  import { defineTheme, extendTheme } from "svelte-highlight/theme";
  import atomOneDark from "svelte-highlight/themes/atom-one-dark";

  const midnight = defineTheme({
    name: "midnight",
    roles: {
      background: "#0b1021",
      foreground: "#d6deeb",
      comment: { color: "#637777", fontStyle: "italic" },
      keyword: "#c792ea",
      // ...
    },
  });

  const branded = extendTheme(atomOneDark, {
    name: "atom-one-dark-branded",
    roles: { keyword: "#c792ea" },
  });
<\/script>

<HighlightStyle theme={mode === "defineTheme" ? midnight : branded}>
  <Highlight language={typescript} {code} />
</HighlightStyle>`;
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<div class="controls">
  <fieldset>
    <legend>API</legend>
    {#each modes as value}
      <button
        type="button"
        class="mode-button"
        class:selected={mode === value}
        on:click={() => (mode = value)}
      >
        {value}()
      </button>
    {/each}
  </fieldset>

  {#if mode === "defineTheme"}
    <div class="swatches">
      <label class="swatch"
        ><input type="color" bind:value={background}>background</label
      >
      <label class="swatch"
        ><input type="color" bind:value={foreground}>foreground</label
      >
      <label class="swatch"
        ><input type="color" bind:value={comment}>comment</label
      >
      <label class="swatch"
        ><input type="color" bind:value={keyword}>keyword</label
      >
      <label class="swatch"
        ><input type="color" bind:value={string}>string</label
      >
      <label class="swatch"><input type="color" bind:value={fn}>function</label>
      <label class="swatch"><input type="color" bind:value={type}>type</label>
      <label class="swatch"><input type="color" bind:value={tag}>tag</label>
    </div>
  {:else}
    <div class="swatches">
      <label class="swatch"
        ><input type="color" bind:value={keyword}>keyword</label
      >
    </div>
  {/if}
</div>

<p class="hint">
  {#if mode === "defineTheme"}
    <code>defineTheme()</code>
    building a full palette from the ~14 semantic roles above — pick any swatch
    to see it update live.
  {:else}
    <code>{"extendTheme(atomOneDark, { roles: { keyword } })"}</code>
    deriving a branded variant of a shipped palette — only <code>keyword</code>
    (tied to the swatch above) diverges from atom-one-dark.
  {/if}
</p>

<HighlightStyle {theme}>
  <Highlight language={typescript} {code} />
</HighlightStyle>

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  fieldset {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    border: 1px solid var(--cds-ui-04, #8d8d8d);
    border-radius: 4px;
    padding: 0.25rem 0.75rem;
  }

  legend {
    padding: 0 0.25rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .mode-button {
    cursor: pointer;
    border: 1px solid var(--cds-ui-04, #8d8d8d);
    border-radius: 4px;
    background: transparent;
    color: inherit;
    padding: 0.25rem 0.625rem;
    font: inherit;
    font-size: 0.875rem;
  }

  .mode-button.selected {
    background: var(--cds-interactive-01, #0f62fe);
    border-color: var(--cds-interactive-01, #0f62fe);
    color: var(--cds-text-04, #ffffff);
  }

  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .swatch {
    display: inline-flex;
    gap: 0.375rem;
    align-items: center;
    cursor: pointer;
    font-size: 0.8125rem;
  }

  .swatch input[type="color"] {
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border: 1px solid var(--cds-ui-04, #8d8d8d);
    border-radius: 4px;
    background: none;
    cursor: pointer;
  }

  .hint {
    margin-bottom: 1rem;
    font-size: 0.875rem;
    opacity: 0.8;
  }

  code {
    font-family: var(--cds-code-02-font-family, monospace);
  }
</style>
