/**
 * Engine vs hljs wall-time benchmark on large real files from this repo.
 * Budget: engine <= 1.5x hljs, as the median of paired per-round ratios.
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

function time(fn: () => void, iterations: number) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  return (performance.now() - start) / iterations;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2
    ? (sorted[mid] as number)
    : ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2;
}

// hljs and the engine run back to back within each round, and the budget
// checks the median of the per-round ratios. A noisy shared CI runner can
// slow one side for a moment; timing each side in one long block let a
// single burst push a ratio past the budget (2.28x on CI for a case that
// measures 0.85x locally). Pairing cancels drift, and the median drops the
// odd bad round.
const ROUNDS = 9;

console.log("=== engine vs hljs: wall time per highlight() call ===\n");
const rows: string[][] = [
  ["case", "chars", "hljs (ms)", "engine (ms)", "ratio", "budget (<=1.5x)"],
];

let worstRatio = 0;
for (const { language, label, code } of CASES) {
  const iterations = code.length > 200_000 ? 2 : 5;
  const runHljs = () => hljs.highlight(code, { language });
  const runEngine = () => registry.tokenize(code, language);
  // warm up (JIT, regex caches)
  for (let i = 0; i < 3; i++) {
    runHljs();
    runEngine();
  }
  const hljsTimes: number[] = [];
  const engineTimes: number[] = [];
  const ratios: number[] = [];
  for (let round = 0; round < ROUNDS; round++) {
    const hljsMs = time(runHljs, iterations);
    const engineMs = time(runEngine, iterations);
    hljsTimes.push(hljsMs);
    engineTimes.push(engineMs);
    ratios.push(engineMs / hljsMs);
  }
  const ratio = median(ratios);
  worstRatio = Math.max(worstRatio, ratio);
  rows.push([
    label,
    String(code.length),
    median(hljsTimes).toFixed(2),
    median(engineTimes).toFixed(2),
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

if (worstRatio > 1.5) {
  console.error(
    `\nengine benchmark FAILED: worst-case ratio ${worstRatio.toFixed(2)}x exceeds the 1.5x budget`,
  );
  process.exit(1);
}
