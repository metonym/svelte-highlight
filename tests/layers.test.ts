// @reads src/* tsconfig.core.json
// Keeps the source in three layers, so the highlighter can run without Svelte:
//
// - core: no DOM, no framework. Runs in browsers, workers, Node, Bun, Deno.
// - dom: core plus DOM APIs. No framework.
// - svelte: anything, including `.svelte` files.
//
// Core imports only core. DOM imports core and DOM. `tsconfig.core.json`
// type-checks core without the DOM lib; this test keeps its file list
// in sync with CORE below.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const SRC = path.join(import.meta.dir, "../src");

const CORE = [
  "ansi-color.js",
  "ansi-output.js",
  "ansi.js",
  "auto-detect.js",
  // Core, but left out of `tsconfig.core.json`: its optional
  // `highlight.js` import pulls in the DOM lib through hljs's typings.
  "compat.js",
  "convert-language.js",
  "copy-transforms.js",
  "css-walk.js",
  "diff-controller.js",
  "diff-edits.js",
  "diff-html.js",
  "diff-languages.js",
  "diff.js",
  "editable-commands.js",
  "editable-css-paint.js",
  "editable-dom-paint.js",
  "editable-history.js",
  "engine.js",
  "fence.js",
  "highlight-cascade.js",
  "highlight-theme.js",
  "incremental-tokenize.js",
  "load-language.js",
  "registry.js",
  "scoped.js",
  "split-lines.js",
  "stream-final-highlight.js",
  "stream-highlighted.js",
  "stream-highlighter.js",
  "stream-preview.js",
  "stream-regenerate.js",
  "stream-sealed-chunks.js",
  "style-registry.js",
  "styled-tokens.js",
  "text-diff.js",
  "textmate-theme.js",
  "theme-style.js",
  "theme-vars.js",
  "theme.js",
  "tokenized-document.js",
  "transformers.js",
  "typewriter-easing.js",
  "typewriter-units.js",
  "worker.js",
];

const DOM = [
  "action.js",
  "css-highlights-paint.js",
  "css-highlights.js",
  "dom.js",
  "editable.js",
  "editable-line-dom.js",
  "editable-painter.js",
  "highlight-painter.js",
  "search.js",
  "stream.js",
  "virtual-window.js",
];

const SVELTE = ["code-region.js", "index.js", "preprocessor.js", "static.js"];

/** Packages each layer may import, by exact specifier. */
const ALLOWED_PACKAGES: Record<string, string[]> = {
  "compat.js": ["highlight.js/lib/core"],
};

/** Generated at build time; framework-free data. */
const GENERATED_DIRS = ["languages", "themes", "styles"];

// `import … from "x"`, `export … from "x"`, and `import "x"` at line start.
const STATIC_SPECIFIER =
  /^(?:import|export)\s+(?:type\s+)?(?:(?:\{[^}]*\}|\*(?:\s+as\s+\w+)?|\w+(?:\s*,\s*\{[^}]*\})?)\s*from\s*)?(["'])([^"']+)\1/gm;

// `import("x")`, in code or in a JSDoc type.
const DYNAMIC_SPECIFIER = /\bimport\(\s*(["'`])([^"'`]+)\1/g;

function specifiersOf(file: string): string[] {
  const source = readFileSync(path.join(SRC, file), "utf8");
  return [
    ...source.matchAll(STATIC_SPECIFIER),
    ...source.matchAll(DYNAMIC_SPECIFIER),
  ].map((m) => m[2] as string);
}

/** Maps `./engine.d.ts`, `./ansi`, `./engine.js` to `engine.js`. */
function localModule(specifier: string): string {
  const name = specifier.slice(2).replace(/\.d\.ts$/, ".js");
  return path.extname(name) ? name : `${name}.js`;
}

/** Returns the reason `specifier` breaks the rules for `file`, if any. */
function violation(
  file: string,
  specifier: string,
  allowed: string[],
): string | undefined {
  if (!specifier.startsWith("./")) {
    return ALLOWED_PACKAGES[file]?.includes(specifier)
      ? undefined
      : `imports package "${specifier}"`;
  }
  const local = specifier.slice(2);
  if (
    GENERATED_DIRS.some((dir) => local === dir || local.startsWith(`${dir}/`))
  )
    return undefined;
  const target = localModule(specifier);
  return allowed.includes(target) ? undefined : `imports "${specifier}"`;
}

describe("source layers", () => {
  it("assigns every top-level module in src/ to exactly one layer", () => {
    const modules = readdirSync(SRC)
      .filter((name) => name.endsWith(".js"))
      .sort();
    const assigned = [...CORE, ...DOM, ...SVELTE].sort();
    expect(assigned).toEqual(modules);
  });

  it("keeps core free of the DOM, Svelte, and non-core modules", () => {
    const problems = CORE.flatMap((file) =>
      specifiersOf(file)
        .map((spec) => violation(file, spec, CORE))
        .filter(Boolean)
        .map((reason) => `${file} ${reason}`),
    );
    expect(problems).toEqual([]);
  });

  it("keeps the DOM layer free of Svelte", () => {
    const allowed = [...CORE, ...DOM];
    const problems = DOM.flatMap((file) =>
      specifiersOf(file)
        .map((spec) => violation(file, spec, allowed))
        .filter(Boolean)
        .map((reason) => `${file} ${reason}`),
    );
    expect(problems).toEqual([]);
  });

  it("type-checks every core module except compat.js without the DOM lib", () => {
    const config = JSON.parse(
      readFileSync(path.join(SRC, "../tsconfig.core.json"), "utf8"),
    ) as { files: string[] };
    const checked = config.files
      .filter((file) => file.startsWith("src/"))
      .map((file) => file.slice("src/".length))
      .sort();
    expect(checked).toEqual(CORE.filter((file) => file !== "compat.js"));
  });
});
