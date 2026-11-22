<script>
  // The same component under the DOM, with HTML elements in the snippets.
  import HighlightTokens from "../../src/HighlightTokens.svelte";

  const { code, language, theme = undefined } = $props();
</script>

<HighlightTokens {code} {language} {theme}>
  {#snippet children({ lines, foreground, background })}
    <pre
      style:color={foreground}
      style:background>{#each lines as tokens, index}{#if index > 0}{"\n"}{/if}{#each tokens as token}<span
        style:color={token.color}
        style:font-weight={token.bold ? "bold" : undefined}>{token.text}</span
      >{/each}{/each}</pre>
  {/snippet}
</HighlightTokens>
