import { existsSync } from "node:fs";
import path from "node:path";

const SPECIFIER = /svelte-highlight\/styles\/([\w-]+?)(\.css)?["\s]/g;

describe("SUPPORTED_STYLES.md", () => {
  it("every documented import specifier resolves to a file on disk", async () => {
    const markdown = await Bun.file(
      path.resolve(import.meta.dir, "../SUPPORTED_STYLES.md"),
    ).text();

    const specifiers = [...markdown.matchAll(SPECIFIER)];
    expect(specifiers.length).toBeGreaterThan(0);

    for (const [, name, ext] of specifiers) {
      const file = path.resolve(
        import.meta.dir,
        `../src/styles/${name}${ext ?? ".js"}`,
      );
      expect(existsSync(file)).toBe(true);
    }
  });
});
