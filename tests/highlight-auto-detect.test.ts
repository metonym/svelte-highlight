import hljs from "highlight.js/lib/core";
import svelte from "../src/languages/svelte";

hljs.registerLanguage(svelte.name, svelte.register);

test("highlightAuto detects a registered custom grammar within a subset", () => {
  const code =
    "<script>\n  let count = $state(0);\n</script>\n\n{#each items as item}\n  <li>{item}</li>\n{/each}";

  const result = hljs.highlightAuto(code, ["svelte", "javascript", "html"]);

  expect(result.language).toBe("svelte");
});
