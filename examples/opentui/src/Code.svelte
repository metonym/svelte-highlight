<script>
  import HighlightTokens from "svelte-highlight/HighlightTokens.svelte";

  let { code, language, theme, title } = $props();
</script>

<HighlightTokens {code} {language} {theme}>
  {#snippet children({ lines, foreground, background })}
    <box
      border
      borderStyle="rounded"
      {title}
      flexDirection="column"
      paddingLeft={1}
      backgroundColor={background}
    >
      {#each lines as tokens, index}
        <text>
          <span fg="#6e7681">{`${String(index + 1).padStart(3)}  `}</span>
          {#each tokens as token}
            <span
              fg={token.color ?? foreground}
              bg={token.background}
              bold={token.bold}
              italic={token.italic}
              underline={token.underline}
              strikethrough={token.strikethrough}>{token.text}</span
            >
          {/each}
        </text>
      {/each}
    </box>
  {/snippet}
</HighlightTokens>
