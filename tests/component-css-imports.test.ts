// @reads src/**/*.svelte
import { join } from "node:path";
import { compile } from "svelte/compiler";

const SRC_DIR = join(import.meta.dir, "..", "src");

// Svelte keeps an `@import` in a `<style>` block as written. With injected
// CSS (vite-plugin-svelte compiles prebundled dependencies that way in dev),
// the browser resolves a relative `@import` against the page URL, which 404s
// (#663). A relative `url()` breaks the same way. Shipped components must not
// depend on the bundler resolving a file.
describe("component styles", () => {
  const files = [...new Bun.Glob("**/*.svelte").scanSync({ cwd: SRC_DIR })];

  test("finds the components", () => {
    expect(files).toContain("LangTag.svelte");
    expect(files).toContain("LineNumbers.svelte");
  });

  for (const file of files) {
    test(`${file} injects no @import or relative url()`, async () => {
      const source = await Bun.file(join(SRC_DIR, file)).text();
      // `css.code` is the text that `css: "injected"` puts on the page.
      const { css } = compile(source, { filename: file, css: "external" });
      const text = css?.code ?? "";
      expect(text).not.toContain("@import");
      expect(text).not.toMatch(/url\(\s*(?!['"]?(?:data:|https?:|#))/);
    });
  }
});
