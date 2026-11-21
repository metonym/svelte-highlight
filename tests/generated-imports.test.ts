// @depends-on scripts/build-languages.ts scripts/convert-grammars.ts scripts/custom-languages/** scripts/hljs-patches/** scripts/build-detect-index.ts scripts/build-themes.ts scripts/build-styles.ts scripts/custom-styles/**
import { readFileSync } from "node:fs";

// Node ESM (no bundler) needs explicit extensions; Bun resolves either way.
const RELATIVE_SPECIFIER = /from\s+["'](\.{1,2}\/[^"']*)["']/g;

for (const file of [
  "src/languages/index.js",
  "src/styles/index.js",
  "src/themes/index.js",
]) {
  test(`${file} imports use explicit .js extensions`, () => {
    const source = readFileSync(file, "utf8");
    const specifiers = [...source.matchAll(RELATIVE_SPECIFIER)].map(
      (match) => match[1],
    );
    expect(specifiers.length).toBeGreaterThan(0);
    expect(specifiers.filter((s) => !s?.endsWith(".js"))).toEqual([]);
  });
}
