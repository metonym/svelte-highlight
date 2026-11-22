<script>
  // A terminal-style tree: no HTML elements, colors as attributes.
  import HighlightTokens from "../../src/HighlightTokens.svelte";

  const { code: initialCode, language, theme } = $props();
  // svelte-ignore state_referenced_locally
  let code = $state(initialCode);

  /** @param {string} next */
  export function setCode(next) {
    code = next;
  }
</script>

<box>
  <HighlightTokens {code} {language} {theme}>
    {#snippet line(tokens)}
      <line>
        {#each tokens as token}
          <text fg={token.color} bold={token.bold}>{token.text}</text>
        {/each}
      </line>
    {/snippet}
  </HighlightTokens>
</box>
