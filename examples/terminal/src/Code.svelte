<script>
  import HighlightTokens from "svelte-highlight/HighlightTokens.svelte";

  let { code, language, theme, numbers = true } = $props();
</script>

<HighlightTokens {code} {language} {theme}>
  {#snippet line(tokens, index)}
    <line>
      {#if numbers}
        <text fg="#6e7681">{`${String(index + 1).padStart(4)}  `}</text>
      {/if}
      {#each tokens as token}
        <text
          fg={token.color}
          bg={token.background}
          bold={token.bold}
          italic={token.italic}
          underline={token.underline}>{token.text}</text
        >
      {/each}
    </line>
  {/snippet}
</HighlightTokens>
