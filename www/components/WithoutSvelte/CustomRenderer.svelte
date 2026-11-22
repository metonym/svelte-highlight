<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { HighlightSvelte } from "svelte-highlight";

  const snippet = `<svelte:options customRenderer="terminal-renderer" />

<script>
  import HighlightTokens from "svelte-highlight/HighlightTokens.svelte";
  import rust from "svelte-highlight/languages/rust";
  import githubDark from "svelte-highlight/themes/github-dark";

  let { code } = $props();
<\/script>

<HighlightTokens {code} language={rust} theme={githubDark}>
  {#snippet line(tokens)}
    <line>
      {#each tokens as token}
        <text fg={token.color} bold={token.bold}>{token.text}</text>
      {/each}
    </line>
  {/snippet}
</HighlightTokens>`;
</script>

<HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
