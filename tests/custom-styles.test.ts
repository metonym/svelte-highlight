import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { Glob } from "bun";
import { NON_MINIFIED_CSS } from "../scripts/utils/regexes.ts";

const CUSTOM_DIR = path.join(import.meta.dir, "../scripts/custom-styles");
const HLJS_DIR = path.join(
  import.meta.dir,
  "../node_modules/highlight.js/styles",
);

const customFiles = existsSync(CUSTOM_DIR)
  ? readdirSync(CUSTOM_DIR).filter((file) => file.endsWith(".css"))
  : [];

test("custom style names are kebab-case and do not collide with highlight.js", async () => {
  const hljsNames = new Set<string>();
  const glob = new Glob("**/*");
  for await (const file of glob.scan(HLJS_DIR)) {
    if (!NON_MINIFIED_CSS.test(file)) continue;
    hljsNames.add(path.parse(file).name);
  }

  for (const file of customFiles) {
    expect(file).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*\.css$/);
    const name = path.parse(file).name;
    expect(hljsNames.has(name)).toBe(false);
  }
});

test("custom styles include structural rules and a base .hljs palette", async () => {
  const contents = await Promise.all(
    customFiles.map((file) => Bun.file(path.join(CUSTOM_DIR, file)).text()),
  );
  for (const css of contents) {
    expect(css).toContain("pre code.hljs");
    expect(css).toContain("code.hljs");
    expect(css).toMatch(/\.hljs\s*\{[^}]*color:/);
    expect(css).toMatch(/\.hljs\s*\{[^}]*background:/);
  }
});

test("custom styles and themes are exported after build", async () => {
  const modules = await Promise.all(
    customFiles.map(async (file) => {
      const name = path.parse(file).name;
      const [styleMod, themeMod] = await Promise.all([
        import(`../src/styles/${name}.js`),
        import(`../src/themes/${name}.js`),
      ]);
      return { name, styleMod, themeMod };
    }),
  );

  for (const { name, styleMod, themeMod } of modules) {
    const palette = themeMod.default;

    expect(styleMod.default).toContain("<style>");
    expect(palette.name).toBe(name);
    expect(palette.vars["--shl-bg"]).toBeDefined();
    expect(palette.vars["--shl-fg"]).toBeDefined();

    if (name.endsWith("-dark")) expect(palette.colorScheme).toBe("dark");
    if (name.endsWith("-light")) expect(palette.colorScheme).toBe("light");
  }
});

describe("WCAG contrast", () => {
  function relativeLuminance(hex: string): number {
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
    const lin = (c: number) =>
      c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }

  function contrastRatio(hexA: string, hexB: string): number {
    const lA = relativeLuminance(hexA);
    const lB = relativeLuminance(hexB);
    const l1 = Math.max(lA, lB);
    const l2 = Math.min(lA, lB);
    return (l1 + 0.05) / (l2 + 0.05);
  }

  test("custom style base palettes and comment colors clear WCAG contrast floors", async () => {
    const contents = await Promise.all(
      customFiles.map((file) => Bun.file(path.join(CUSTOM_DIR, file)).text()),
    );

    for (const css of contents) {
      const base = css.match(
        /\.hljs \{\s*color: (#[0-9a-fA-F]{6});\s*background: (#[0-9a-fA-F]{6});/,
      );
      const comment = css.match(
        /\.hljs-comment,\n\.hljs-quote \{\s*color: (#[0-9a-fA-F]{6});/,
      );
      if (!base) throw new Error("expected a .hljs base color/background rule");
      if (!comment) throw new Error("expected a .hljs-comment color rule");
      const [, fg, bg] = base;
      const [, commentColor] = comment;
      if (!fg || !bg || !commentColor) {
        throw new Error(
          "expected .hljs/.hljs-comment rules to capture hex colors",
        );
      }

      // WCAG AA body text floor; already passes for all 90 files.
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
      // Comments are secondary/decorative text, so held to WCAG's large-text
      // floor rather than body text; today's failures are fixed in Step 2.
      expect(contrastRatio(commentColor, bg)).toBeGreaterThanOrEqual(3);
    }
  });
});
