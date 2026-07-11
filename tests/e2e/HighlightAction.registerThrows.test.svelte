<script>
  import { highlight } from "svelte-highlight";

  const source = "const s = 1;";

  // An unbalanced regex source (`"("`) throws a SyntaxError from `new
  // RegExp(...)` when the engine compiles this IR, proving the action's own
  // try/catch guard - not any grammar-level safety net - keeps the element
  // intact.
  /** @type {import("svelte-highlight/languages").LanguageType<string>} */
  const broken = {
    name: "broken-grammar",
    register: {
      name: "broken-grammar",
      caseInsensitive: false,
      unicode: false,
      disableAutodetect: false,
      states: [
        { relevance: 1, rules: [1] },
        { relevance: 1, rules: [], scope: "broken", begin: "(" },
      ],
    },
  };
</script>

<pre><code use:highlight={{ language: broken, code: source }}></code></pre>
