<script>
  import Highlight, { HighlightStyle } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";
  import githubDark from "svelte-highlight/styles/github-dark";

  const code = `interface User {
  id: number;
  name: string;
}

const greet = (user: User): string => {
  return \`Hello, \${user.name}!\`;
};`;

  const modes = ["auto", "light", "dark", "selector"];

  /** @type {"auto" | "light" | "dark" | "selector"} */
  let mode = "auto";

  // For "selector" mode the dark block is gated behind `[data-theme="dark"]`.
  let darkSelectorOn = false;

  const selector = '[data-theme="dark"]';

  $: resolvedMode = mode === "selector" ? selector : mode;
  $: dataTheme = mode === "selector" && darkSelectorOn ? "dark" : undefined;
</script>

<div class="controls">
  <fieldset>
    <legend>mode</legend>
    {#each modes as value}
      <button
        type="button"
        class="mode-button"
        class:selected={mode === value}
        on:click={() => (mode = value)}
      >
        {value}
      </button>
    {/each}
  </fieldset>

  {#if mode === "selector"}
    <label class="toggle">
      <input type="checkbox" bind:checked={darkSelectorOn}>
      apply <code>{selector}</code>
    </label>
  {/if}
</div>

<p class="hint">
  {#if mode === "auto"}
    Following your OS / browser <code>prefers-color-scheme</code>. Switch your
    system theme to see it flip.
  {:else if mode === "light" || mode === "dark"}
    Forcing the <strong>{mode}</strong> theme.
  {:else}
    Dark block is gated behind <code>{selector}</code> on an ancestor — toggle
    the checkbox above.
  {/if}
</p>

<div data-theme={dataTheme}>
  <HighlightStyle light={github} dark={githubDark} mode={resolvedMode}>
    <Highlight language={typescript} {code} />
  </HighlightStyle>
</div>

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

  label {
    display: inline-flex;
    gap: 0.25rem;
    align-items: center;
    cursor: pointer;
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

  .toggle {
    font-size: 0.875rem;
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
