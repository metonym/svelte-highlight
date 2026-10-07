/**
 * Engine vs hljs wall time on large repo files; fails when the median
 * paired per-round ratio exceeds 1.5x hljs.
 */
import coreFactory from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import markdown from "highlight.js/lib/languages/markdown";
import { getCorpus } from "../bench/_shared.ts";
import { createRegistry } from "../src/engine.js";
import cssLang from "../src/languages/css.js";
import javascriptLang from "../src/languages/javascript.js";
import markdownLang from "../src/languages/markdown.js";

const corpus = await getCorpus();
const CASES: { language: string; label: string; code: string }[] = [
  {
    language: "javascript",
    label: "src/*.js + *.svelte concatenated",
    code: corpus.javascript,
  },
  {
    language: "css",
    label: "src/styles/*.css concatenated",
    code: corpus.css,
  },
  {
    language: "markdown",
    label: "README.md + SUPPORTED_LANGUAGES.md",
    code: corpus.markdown,
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

// Paired rounds cancel shared-runner drift; the median drops bad rounds.
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
