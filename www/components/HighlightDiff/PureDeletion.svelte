<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { HighlightDiff } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const diff = `diff --git a/src/legacy.ts b/src/legacy.ts
deleted file mode 100644
--- a/src/legacy.ts
+++ /dev/null
@@ -1,3 +0,0 @@
-export function legacy() {
-  return "deprecated";
-}`;

  /** @type {("both" | "new" | "unified" | "none")[]} */
  const gutters = ["both", "new", "unified", "none"];
</script>

{#each gutters as gutter}
  <p class="label-01 mb-2">gutter="{gutter}"</p>
  <div class="mb-5">
    <HighlightDiff
      {diff}
      {gutter}
      language={typescript}
      class={THEME_MODULE_NAME}
    />
  </div>
{/each}
