/**
 * Engine vs hljs wall-time benchmark on large real files from this repo.
 * Budget: engine <= 1.5x hljs.
 *
 * Run: bun scripts/benchmark-engine.ts
 */
import { readdirSync } from "node:fs";
import coreFactory from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import markdown from "highlight.js/lib/languages/markdown";
import { createRegistry } from "../src/engine.js";
import cssLang from "../src/languages/css.js";
import javascriptLang from "../src/languages/javascript.js";
import markdownLang from "../src/languages/markdown.js";

async function concat(dir: string, filter: (name: string) => boolean) {
  const names = readdirSync(dir).filter(filter);
  const contents = await Promise.all(
    names.map((name) => Bun.file(`${dir}/${name}`).text()),
  );
  return contents.join("\n");
}

const CASES: { language: string; label: string; code: string }[] = [
  {
    language: "javascript",
    label: "src/*.js + *.svelte concatenated",
    code: [
      await concat("src", (name) => name.endsWith(".js")),
      await concat("src", (name) => name.endsWith(".svelte")),
    ].join("\n"),
  },
  {
    language: "css",
    label: "src/styles/*.css concatenated",
    code: await concat("src/styles", (name) => name.endsWith(".css")),
  },
  {
    language: "markdown",
    label: "README.md + SUPPORTED_LANGUAGES.md",
    code: [
      await Bun.file("README.md").text(),
      await Bun.file("SUPPORTED_LANGUAGES.md").text(),
    ].join("\n"),
  },
];

const hljs = coreFactory.newInstance();
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("markdown", markdown);

const registry = createRegistry();
registry.register(javascriptLang.register);
registry.register(cssLang.register);
registry.register(markdownLang.register);

/** @param {() => void} fn */
function time(fn: () => void, iterations: number) {
  // warm up (JIT, regex caches)
  for (let i = 0; i < 3; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  return (performance.now() - start) / iterations;
}

console.log("=== engine vs hljs: wall time per highlight() call ===\n");
const rows: string[][] = [
  ["case", "chars", "hljs (ms)", "engine (ms)", "ratio", "budget (<=1.5x)"],
];

let worstRatio = 0;
for (const { language, label, code } of CASES) {
  const iterations = code.length > 200_000 ? 5 : 15;
  const hljsMs = time(() => hljs.highlight(code, { language }), iterations);
  const engineMs = time(() => registry.tokenize(code, language), iterations);
  const ratio = engineMs / hljsMs;
  worstRatio = Math.max(worstRatio, ratio);
  rows.push([
    label,
    String(code.length),
    hljsMs.toFixed(2),
    engineMs.toFixed(2),
    `${ratio.toFixed(2)}x`,
    ratio <= 1.5 ? "OK" : "OVER BUDGET",
  ]);
}

const columnCount = Math.max(...rows.map((row) => row.length));
const widths = Array.from({ length: columnCount }, (_, i) =>
  Math.max(...rows.map((row) => (row[i] ?? "").length)),
);
for (const row of rows) {
  console.log(row.map((cell, i) => cell.padEnd((widths[i] ?? 0) + 2)).join(""));
}

console.log(
  `\nworst-case ratio: ${worstRatio.toFixed(2)}x ${worstRatio <= 1.5 ? "(within 1.5x budget)" : "(OVER the 1.5x budget)"}`,
);
