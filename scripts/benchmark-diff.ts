/**
 * Diff cost as a ratio of tokenizing the same text, so the budget holds on
 * any runner: fails when diffing real code costs more than DIFF_BUDGET of
 * highlighting it, or a streamed rewrite more than STREAM_BUDGET.
 */
import { getCorpus, scatterEdits } from "../bench/_shared.ts";
import { createDiffSession, diffTexts } from "../src/diff.js";
import { createRegistry } from "../src/engine.js";
import javascriptLang from "../src/languages/javascript.js";
import markdownLang from "../src/languages/markdown.js";

const DIFF_BUDGET = 0.5;
const STREAM_BUDGET = 2;
const ROUNDS = 9;

const corpus = await getCorpus();
const registry = createRegistry();
registry.register(javascriptLang.register);
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

/** Median paired ratio of `run` to tokenizing `code`. */
function ratio(
  code: string,
  language: string,
  run: () => void,
  iterations = 3,
) {
  const tokenize = () => registry.tokenize(code, language);
  for (let i = 0; i < 2; i++) {
    tokenize();
    run();
  }
  const ratios: number[] = [];
  for (let round = 0; round < ROUNDS; round++) {
    const base = time(tokenize, iterations);
    ratios.push(time(run, iterations) / base);
  }
  return median(ratios);
}

function streamed(before: string, after: string, chunks: number) {
  const step = Math.ceil(after.length / chunks);
  const session = createDiffSession();
  for (let i = step; i < after.length + step; i += step) {
    session.update(before, after.slice(0, i), { streaming: true });
  }
  session.update(before, after);
}

const js = corpus.javascript;
const jsEdited = scatterEdits(js, 150);
const md = corpus.markdown;
const mdEdited = scatterEdits(md, 40);
const streamTarget = jsEdited.slice(0, jsEdited.length >> 2);

const cases = [
  {
    label: "diff src/*.js + *.svelte, an edit every 150 lines",
    budget: DIFF_BUDGET,
    value: ratio(jsEdited, "javascript", () => diffTexts(js, jsEdited)),
  },
  {
    label: "diff README + SUPPORTED_LANGUAGES, an edit every 40 lines",
    budget: DIFF_BUDGET,
    value: ratio(mdEdited, "markdown", () => diffTexts(md, mdEdited)),
  },
  {
    label: "stream a quarter of the JS corpus in 200 chunks",
    budget: STREAM_BUDGET,
    value: ratio(
      streamTarget,
      "javascript",
      () => streamed(js, streamTarget, 200),
      1,
    ),
  },
];

console.log("=== diff cost as a multiple of tokenizing the same text ===\n");
let failed = false;
for (const { label, budget, value } of cases) {
  const ok = value <= budget;
  failed ||= !ok;
  console.log(
    `${label.padEnd(58)} ${value.toFixed(3)}x  (budget <= ${budget}x) ${ok ? "OK" : "OVER BUDGET"}`,
  );
}

if (failed) {
  console.error("\ndiff benchmark FAILED: a case is over its budget");
  process.exit(1);
}
