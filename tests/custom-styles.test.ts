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
