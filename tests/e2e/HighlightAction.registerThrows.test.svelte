<script>
  import hljs from "highlight.js/lib/core";
  import { highlight } from "svelte-highlight";

  // highlight.js swallows registration errors in its default "safe mode" and
  // falls back to a plaintext grammar. Disable that so a broken grammar
  // actually throws, proving the action's own guard - not hljs's internal
  // safety net - is what keeps the element intact.
  hljs.debugMode();

  const source = "const s = 1;";

  /** @type {import("svelte-highlight/languages").LanguageType<string>} */
  const broken = {
    name: "broken-grammar",
    register: () => {
      throw new Error("broken grammar");
    },
  };
</script>

<pre><code use:highlight={{ language: broken, code: source }}></code></pre>
