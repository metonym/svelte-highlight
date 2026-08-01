/**
 * The bundle-size claim's other half (see the `highlight-auto-no-grammars`
 * static-app entry for the built-output side): `HighlightAuto.svelte` must
 * not statically import any grammar module. A JSDoc `@type`/`import(...)`
 * type-only reference doesn't count - it's erased at compile time and never
 * reaches the bundle.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE = readFileSync(
  join(import.meta.dir, "../src/HighlightAuto.svelte"),
  "utf8",
);

// Real (value) imports only: `import ... from "./languages/..."`. JSDoc
// type references (`@type {import("./languages").LanguageType<...>}`) use
// the same `import(...)` syntax but never appear as a line-leading
// `import ... from` statement, so this pattern doesn't match them.
const STATIC_LANGUAGE_IMPORT_RE = /^\s*import\s.+from\s+["']\.\/languages\//m;

describe("HighlightAuto.svelte has no static grammar import", () => {
  it('no `import ... from "./languages/..."` statement', () => {
    expect(STATIC_LANGUAGE_IMPORT_RE.test(SOURCE)).toBe(false);
  });

  it("sanity: the source really does reference ./languages (as a type, not a value)", () => {
    // Guards against the above passing vacuously if the file stops
    // mentioning "./languages" at all.
    expect(SOURCE).toContain('import("./languages")');
  });
});
