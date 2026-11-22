<script>
  // Renders no elements of its own, only the caller's snippets, so it
  // compiles under any renderer: the DOM, or a custom renderer such as a
  // terminal, canvas or PDF target. Keep it free of markup and DOM APIs.

  import { tokenLines } from "./engine.js";
  import { ensureRegistered, registry } from "./registry.js";
  import { createTokenStyler } from "./styled-tokens.js";

  /** @type {import("./HighlightTokens.svelte.d.ts").HighlightTokensProps} */
  const { code, language, theme, color, line, children } = $props();

  const styler = $derived(
    theme === undefined ? undefined : createTokenStyler(theme, { color }),
  );

  const events = $derived.by(() => {
    ensureRegistered(language);
    return registry.highlight(String(code ?? ""), { language: language.name })
      .events;
  });

  /** @type {import("./styled-tokens.d.ts").StyledToken[][]} */
  const lines = $derived(styler ? styler.lines(events) : tokenLines(events));

  const block = $derived({
    lines,
    events,
    foreground: styler?.foreground ?? color,
    background: styler?.background,
  });
</script>

{#if children}
  {@render children(block)}
{:else if line}
  {#each lines as tokens, index}
    {@render line(tokens, index)}
  {/each}
{/if}
