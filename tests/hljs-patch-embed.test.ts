/**
 * Custom grammars that embed TypeScript (astro, svelte, ...) import stock
 * `highlight.js/lib/languages/typescript` as a side effect of their own
 * `register()`. Conversion registers patched built-ins last so that does
 * not win. At runtime the embed is an IR `dependencies` entry pointing at
 * `src/languages/typescript.js` (the patched grammar).
 *
 * These tests fail if that dependency is stock TypeScript: `keyof` and
 * `accessor` would stay unstyled. They also fail if load order of the
 * host grammar vs the typescript module restored an unpatched program.
 */
import { createRegistry, registerAll } from "../src/engine.js";
import type { LanguageType } from "../src/languages";
import astro from "../src/languages/astro";
import svelte from "../src/languages/svelte";
import typescript from "../src/languages/typescript";

const ASTRO_SNIPPET = `---
type Keys = keyof T;
class Counter {
  accessor count = 0;
}
---
<p>ok</p>`;

const SVELTE_SNIPPET = `<script lang="ts">
type Keys = keyof T;
class Counter {
  accessor count = 0;
}
</script>
<p>ok</p>`;

function highlight(
  host: LanguageType<string>,
  code: string,
  language: string,
  order: "host-first" | "typescript-first",
) {
  const registry = createRegistry();
  if (order === "typescript-first") {
    registerAll(registry, typescript);
    registerAll(registry, host);
  } else {
    registerAll(registry, host);
    registerAll(registry, typescript);
  }
  return registry.highlight(code, { language }).value;
}

function expectPatchedTypescriptEmbed(html: string) {
  expect(html).toContain("language-typescript");
  expect(html).toContain('<span class="hljs-keyword">keyof</span>');
  expect(html).toContain('<span class="hljs-keyword">accessor</span>');
  expect(html).toContain('<span class="hljs-name">p</span>');
}

describe("patched TypeScript survives custom-grammar embeds", () => {
  it("astro frontmatter uses patched TypeScript when astro is registered first", () => {
    expectPatchedTypescriptEmbed(
      highlight(astro, ASTRO_SNIPPET, "astro", "host-first"),
    );
  });

  it("astro frontmatter uses patched TypeScript when typescript is registered first", () => {
    expectPatchedTypescriptEmbed(
      highlight(astro, ASTRO_SNIPPET, "astro", "typescript-first"),
    );
  });

  it("svelte lang=ts scripts use patched TypeScript when svelte is registered first", () => {
    expectPatchedTypescriptEmbed(
      highlight(svelte, SVELTE_SNIPPET, "svelte", "host-first"),
    );
  });

  it("svelte lang=ts scripts use patched TypeScript when typescript is registered first", () => {
    expectPatchedTypescriptEmbed(
      highlight(svelte, SVELTE_SNIPPET, "svelte", "typescript-first"),
    );
  });
});
