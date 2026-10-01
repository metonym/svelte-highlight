<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { HighlightDiff } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const diff = `diff --git a/src/greet.ts b/src/greet.ts
new file mode 100644
--- /dev/null
+++ b/src/greet.ts
@@ -0,0 +1,5 @@
+export function greet(name: string) {
+  return "Hello, " + name + "!";
+}
+
+export const farewell = (name: string) => "Bye, " + name + ".";`;

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
