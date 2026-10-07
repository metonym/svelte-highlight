/** scopeStyle()/dualStyle() and highlightRules() on hljs's unminified theme CSS. */
import { dirname } from "node:path";
import { group, task } from "ostia";
import { highlightRules } from "../src/highlight-theme.js";
import { dualStyle, scopeStyle } from "../src/scoped.js";
import { concat } from "./_shared.ts";

const stylesDir = dirname(
  Bun.resolveSync("highlight.js/styles/github.css", import.meta.dir),
);

async function readStyle(name: string) {
  return Bun.file(`${stylesDir}/${name}.css`).text();
}

// Every unminified hljs theme (~190 KB).
const allThemes = await concat(
  stylesDir,
  (name) => name.endsWith(".css") && !name.endsWith(".min.css"),
);

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
