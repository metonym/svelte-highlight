import { join } from "node:path";
import { compile } from "svelte/compiler";

const SRC_DIR = join(import.meta.dir, "..", "src");

// Svelte keeps an `@import` in a `<style>` block as written. With injected
// CSS (vite-plugin-svelte compiles prebundled dependencies that way in dev),
// the browser resolves a relative `@import` against the page URL, which 404s
// (#663). Shipped components must not depend on bundler `@import` resolution.
describe("component styles", () => {
  const files = [...new Bun.Glob("**/*.svelte").scanSync({ cwd: SRC_DIR })];

  test("finds the components", () => {
    expect(files).toContain("LangTag.svelte");
    expect(files).toContain("LineNumbers.svelte");
  });

  for (const file of files) {
    test(`${file} injects no @import`, async () => {
      const source = await Bun.file(join(SRC_DIR, file)).text();
      const { js } = compile(source, {
        filename: file,
        css: "injected",
        generate: "client",
      });
      expect(js.code).not.toContain("@import");
    });
  }
});
