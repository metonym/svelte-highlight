import { existsSync } from "node:fs";
import { join } from "node:path";

const PACKAGE_DIR = join(import.meta.dir, "..", "package");
const packageExists = existsSync(join(PACKAGE_DIR, "package.json"));

/** @param {string} target An exports-map value, e.g. "./ansi.js" or "./styles/*.css". */
function assertResolvable(target: string) {
  const relative = target.replace(/^\.\//, "");
  if (relative.includes("*")) {
    const glob = new Bun.Glob(relative);
    const matches = [...glob.scanSync({ cwd: PACKAGE_DIR })];
    expect(matches.length).toBeGreaterThan(0);
  } else {
    expect(existsSync(join(PACKAGE_DIR, relative))).toBe(true);
  }
}

if (packageExists) {
  describe("published package shape", () => {
    test("every exports map entry resolves to a file on disk", async () => {
      const pkgJson = await Bun.file(join(PACKAGE_DIR, "package.json")).json();

      for (const conditions of Object.values(pkgJson.exports)) {
        const targets =
          typeof conditions === "string"
            ? [conditions]
            : Object.values(conditions as Record<string, string>);

        for (const target of targets) assertResolvable(target);
      }
    });

    test("every sideEffects glob matches at least one published file", async () => {
      const pkgJson = await Bun.file(join(PACKAGE_DIR, "package.json")).json();

      expect(pkgJson.sideEffects.length).toBeGreaterThan(0);

      for (const pattern of pkgJson.sideEffects as string[]) {
        const glob = new Bun.Glob(pattern);
        const matches = [...glob.scanSync({ cwd: PACKAGE_DIR })];
        expect(matches.length).toBeGreaterThan(0);
      }
    });

    test("ansi.js resolves without the svelte condition and exposes parseAnsi", async () => {
      const mod = await import(join(PACKAGE_DIR, "ansi.js"));
      expect(typeof mod.parseAnsi).toBe("function");
    });
  });
} else {
  console.warn(
    "Skipping tests/package-shape.test.ts: ./package not found. Run `bun run build:lib && bun run package` first.",
  );
}
