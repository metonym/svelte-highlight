// Code samples for the css-highlights color parity tests.
import c from "svelte-highlight/languages/c.js";
import css from "svelte-highlight/languages/css.js";
import diff from "svelte-highlight/languages/diff.js";
import javascript from "svelte-highlight/languages/javascript.js";
import markdown from "svelte-highlight/languages/markdown.js";
import python from "svelte-highlight/languages/python.js";
import xml from "svelte-highlight/languages/xml.js";

// Compound scopes (title.function_, title.class_.inherited__), nested
// scopes (params, subst), descendant rules (.hljs-meta .hljs-keyword),
// and backgrounds (addition, deletion).
export const samples = [
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
