<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button, NumberInput } from "carbon-components-svelte";
  import typescript from "svelte-highlight/languages/typescript";
  import { createTokenizedDocument } from "svelte-highlight/tokenized-document";
  import { generateTypeScript } from "./generate-large-code.js";

  const LINE_COUNT = 25_000;
  const code = generateTypeScript(LINE_COUNT);

  const doc = createTokenizedDocument({ language: typescript });
  doc.setCode(code);

  let start = 15_000;
  let end = 15_010;
  /** @type {string[]} */
  let lines = [];
  let tokenizedThrough = doc.tokenizedThrough();

  function run() {
    const clampedStart = Math.max(0, Math.min(start ?? 0, LINE_COUNT));
    const clampedEnd = Math.max(clampedStart, Math.min(end ?? 0, LINE_COUNT));
    lines = doc.lineRange(clampedStart, clampedEnd);
    tokenizedThrough = doc.tokenizedThrough();
  }

  // Show a live result immediately rather than an empty box pre-interaction.
  run();
</script>

<p class="label-01 mb-3">
  <code class="code">TokenizedDocument</code>, headless -- no component, no DOM
  virtualization, just <code class="code">lineRange(start, end)</code> for a
  {LINE_COUNT.toLocaleString()}-line document. Useful for custom virtualization,
  servers, or tests.
</p>

<div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 1rem">
  <NumberInput
    id="range-start"
    size="sm"
    min={0}
    max={LINE_COUNT}
    bind:value={start}
    labelText="start"
  />
  <NumberInput
    id="range-end"
    size="sm"
    min={0}
    max={LINE_COUNT}
    bind:value={end}
    labelText="end"
  />
  <Button size="small" kind="tertiary" on:click={run}
    >lineRange(start, end)</Button
  >
  <p class="label-01" style="margin-bottom: 0.5rem">
    tokenizedThrough(): <code class="code">{tokenizedThrough}</code>
  </p>
</div>

{#if lines.length}
  <pre class={THEME_MODULE_NAME} style="margin-top: 0.75rem"><code
      class:hljs={true}>{#each lines as line, i}{#if i > 0}{"\n"}{/if}{@html line}{/each}</code
    ></pre>
{/if}
