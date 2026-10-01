<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { HighlightDiff } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const beforeLines = Array.from(
    { length: 15 },
    (_, i) => `const line${i + 1} = ${i + 1};`,
  );
  const before = beforeLines.join("\n");

  const afterLines = [...beforeLines];
  afterLines[2] = "const line3 = 300;";
  afterLines[7] = "const line8 = 800;";
  afterLines[12] = "const line13 = 1300;";
  const after = afterLines.join("\n");

  /** @type {("both" | "new" | "unified" | "none")[]} */
  const gutters = ["both", "new", "unified", "none"];
</script>

{#each gutters as gutter}
  <p class="label-01 mb-2">gutter="{gutter}"</p>
  <div class="mb-5">
    <HighlightDiff
      {before}
      {after}
      {gutter}
      context={2}
      language={typescript}
      class={THEME_MODULE_NAME}
    />
  </div>
{/each}
