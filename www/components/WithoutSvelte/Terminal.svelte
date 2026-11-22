<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Select, SelectItem } from "carbon-components-svelte";
  import { AnsiOutput, CodeWindow } from "svelte-highlight";
  import Highlight from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import rust from "svelte-highlight/languages/rust";
  import { ensureRegistered, registry } from "svelte-highlight/registry";
  import { styleTokens, toAnsi } from "svelte-highlight/styled-tokens";
  import githubDark from "svelte-highlight/themes/github-dark";
  import monokai from "svelte-highlight/themes/monokai";
  import nord from "svelte-highlight/themes/nord";
  import tokyoNightDark from "svelte-highlight/themes/tokyo-night-dark";

  const snippet = `import { registry, ensureRegistered } from "svelte-highlight/registry";
import { styleTokens, toAnsi } from "svelte-highlight/styled-tokens";
import rust from "svelte-highlight/languages/rust";
import githubDark from "svelte-highlight/themes/github-dark";

ensureRegistered(rust);
const { events } = registry.highlight(code, { language: "rust" });

console.log(toAnsi(styleTokens(events, githubDark)));`;

  const code = [
    "/// Adds one, saturating at `u32::MAX`.",
    "#[inline]",
    "pub fn add_one(x: u32) -> u32 {",
    "    let next = x.saturating_add(1);",
    '    println!("{x} -> {next}");',
    "    next",
    "}",
  ].join("\n");

  /** @type {Record<string, import("svelte-highlight/theme").ThemePalette>} */
  const themes = {
    "github-dark": githubDark,
    monokai,
    nord,
    "tokyo-night-dark": tokyoNightDark,
  };
  let themeName = "github-dark";

  ensureRegistered(rust);
  const { events } = registry.highlight(code, { language: "rust" });

  $: styled = styleTokens(events, themes[themeName] ?? githubDark);
  $: text = toAnsi(styled);
</script>

<Highlight language={javascript} code={snippet} class={THEME_MODULE_NAME} />

<div class="demo">
  <Select size="sm" labelText="Theme" bind:selected={themeName}>
    {#each Object.keys(themes) as name}
      <SelectItem value={name} />
    {/each}
  </Select>
  <CodeWindow variant="terminal" title="node print.js">
    <AnsiOutput {text} --ansi-background={styled.background} />
  </CodeWindow>
</div>

<style>
  .demo {
    margin-top: var(--cds-spacing-05);
  }

  .demo :global(.bx--select) {
    max-width: 16rem;
    margin-bottom: var(--cds-spacing-05);
  }
</style>
