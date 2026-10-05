/**
 * Theme CSS rewriting: scoped.js's selector scoping (what HighlightStyle
 * runs for a string theme on every mount and SSR render) and
 * highlight-theme.js's `::highlight()` conversion (HighlightEditable's
 * "css-highlights" engine). Both walk the CSS by hand via css-walk.js.
 *
 * Fixtures are highlight.js's own unminified theme stylesheets (the same
 * inputs the generated `svelte-highlight/styles/*` modules start from),
 * read from node_modules so the suite doesn't need a `build:lib` run.
 */
import { readdirSync } from "node:fs";
import { dirname } from "node:path";
import { group, task } from "ostia";
import { highlightRules } from "../src/highlight-theme.js";
import { dualStyle, scopeStyle } from "../src/scoped.js";

const stylesDir = dirname(
  Bun.resolveSync("highlight.js/styles/github.css", import.meta.dir),
);

async function readStyle(name: string) {
  return Bun.file(`${stylesDir}/${name}.css`).text();
}

// Every unminified hljs theme, concatenated: a stress-size input (~190 KB).
const allThemes = (
  await Promise.all(
    readdirSync(stylesDir)
      .filter((name) => name.endsWith(".css") && !name.endsWith(".min.css"))
      .map((name) => Bun.file(`${stylesDir}/${name}`).text()),
  )
).join("\n");

const light = `<style>${await readStyle("github")}</style>`;
const dark = `<style>${await readStyle("github-dark")}</style>`;
const SCOPE = "svh-scope-bench";

group("scopeStyle()", () => {
  task("github (<style>-wrapped)", () => scopeStyle(light, SCOPE));
  task("every hljs theme concatenated", () => scopeStyle(allThemes, SCOPE));
});

group("dualStyle()", () => {
  task("github / github-dark, auto", () => dualStyle(light, dark, SCOPE));
});

group("highlightRules()", () => {
  task("github (<style>-wrapped)", () => highlightRules(light));
  task("every hljs theme concatenated", () => highlightRules(allThemes));
});

// Run this suite with `ostia bench bench/scoped.bench.ts` for a fast feedback
// loop; `bun run bench` runs every *.bench.ts suite for a full-baseline run.
