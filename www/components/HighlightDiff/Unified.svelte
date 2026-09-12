<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { HighlightDiff } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const diff = `diff --git a/src/greet.ts b/src/greet.ts
--- a/src/greet.ts
+++ b/src/greet.ts
@@ -1,5 +1,5 @@
 export function greet(name: string) {
-  return "Hello, " + name;
+  return "Hello, " + name + "!";
 }

-export const farewell = (name: string) => "Bye, " + name;
+export const farewell = (name: string) => "Bye, " + name + ".";
diff --git a/src/index.ts b/src/index.ts
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,2 +1,3 @@
 import { greet } from "./greet";

+console.log(greet("world"));`;
</script>

<HighlightDiff {diff} language={typescript} class={THEME_MODULE_NAME} />
