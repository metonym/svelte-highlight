<script>
  import Highlight, { HighlightStyle } from "svelte-highlight";
  import c from "svelte-highlight/languages/c";
  import css from "svelte-highlight/languages/css";
  import diff from "svelte-highlight/languages/diff";
  import javascript from "svelte-highlight/languages/javascript";
  import markdown from "svelte-highlight/languages/markdown";
  import python from "svelte-highlight/languages/python";
  import xml from "svelte-highlight/languages/xml";
  import { BASE_CSS } from "svelte-highlight/themes/_base-css";

  /**
   * Theme CSS or a `ThemePalette`.
   * @type {string | import("svelte-highlight/theme").ThemePalette}
   */
  export let theme;

  // Compound scopes (title.function_, title.class_.inherited__), nested
  // scopes (params, subst), descendant rules (.hljs-meta .hljs-keyword),
  // and backgrounds (addition, deletion).
  const samples = [
    {
      language: javascript,
      code: `/** @param {string} url */
async function load(url, retries = 3) {
  const res = await fetch(\`\${url}?n=\${retries}\`);
  if (!/^2/.test(String(res.status))) throw new Error("bad");
  return new Promise((resolve) => resolve(res.json()));
}
class Cache extends Map {
  get size() { return super.size + this.extra; }
}
console.log(load, null, true, 0x1f);`,
    },
    {
      language: c,
      code: `#include <stdio.h>
#define MAX 10
int main(void) { printf("%d\\n", MAX); return 0; }`,
    },
    {
      language: python,
      code: `@cache
def fib(n: int) -> int:
    """Doc."""
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(f"{fib(10)!r}", self, None)`,
    },
    {
      language: diff,
      code: `@@ -1,2 +1,2 @@
-old line
+new line
 same`,
    },
    {
      language: markdown,
      code: `# Title
- *em* and **strong**
> quote
[link](https://example.com) and \`code\``,
    },
    {
      language: xml,
      code: `<?xml version="1.0"?>
<!-- note -->
<a href="x" id='y'>text &amp; more</a>`,
    },
    {
      language: css,
      code: `@media screen { a.b#c:hover, [d="e"]::after { color: #fff !important; } }`,
    },
  ];
</script>

<!-- Palettes need base.css. String themes never load it, so keep it out. -->
<svelte:head>
  {#if typeof theme === "object"}
    {@html `<style>${BASE_CSS}</style>`}
  {/if}
</svelte:head>

<HighlightStyle {theme}>
  {#each samples as sample, index}
    <div data-engine="dom" data-sample={index}>
      <Highlight language={sample.language} code={sample.code} />
    </div>
    <div data-engine="css-highlights" data-sample={index}>
      <Highlight
        language={sample.language}
        code={sample.code}
        engine="css-highlights"
        {theme}
      />
    </div>
  {/each}
</HighlightStyle>
