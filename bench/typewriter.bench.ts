/**
 * typewriter-units.js: the three passes `Typewriter.svelte` runs over
 * highlighted HTML - tokenizeTypewriter (HTML -> units, once per
 * `highlighted` change), buildUnitMarkup (units -> per-unit-span HTML,
 * once per `highlighted` change), and createTypewriterSplitter's splitAt
 * (once per animation frame, called with a monotonically increasing
 * `count` as more characters reveal).
 */
import { group, task } from "ostia";
import { renderHtml } from "../src/engine.js";
import {
  buildUnitMarkup,
  createTypewriterSplitter,
  tokenizeTypewriter,
} from "../src/typewriter-units.js";
import { buildRegistry, getCorpus, sizedSlice } from "./_shared.ts";

const registry = await buildRegistry();
const corpus = await getCorpus();

const SIZES = [1_000, 10_000, 30_000];

function highlightedHtml(size: number) {
  const code = sizedSlice(corpus.javascript, size);
  return renderHtml(registry.tokenize(code, "javascript").events);
}

group("tokenizeTypewriter()", () => {
  for (const size of SIZES) {
    const html = highlightedHtml(size);
    task(`${size.toLocaleString()} chars of highlighted HTML`, () =>
      tokenizeTypewriter(html),
    );
  }
});

group("buildUnitMarkup()", () => {
  for (const size of SIZES) {
    const units = tokenizeTypewriter(highlightedHtml(size));
    task(`${size.toLocaleString()} chars of highlighted HTML`, () =>
      buildUnitMarkup(units),
    );
  }
});

/** Simulates one full typewriter run: splitAt called once per revealed unit, in order. */
function revealAll(html: string, units: ReturnType<typeof tokenizeTypewriter>) {
  const splitter = createTypewriterSplitter(units, html);
  const total = units.reduce((sum, unit) => sum + unit.visible, 0);
  const results: unknown[] = [];
  for (let count = 0; count <= total; count++) {
    results.push(splitter.splitAt(count));
  }
  return results;
}

group("createTypewriterSplitter(): full reveal simulation", () => {
  for (const size of SIZES) {
    const html = highlightedHtml(size);
    const units = tokenizeTypewriter(html);
    task(`${size.toLocaleString()} chars, 1 splitAt() per unit`, () =>
      revealAll(html, units),
    );
  }
});

// Run this suite with `ostia bench bench/typewriter.bench.ts` for a fast
// feedback loop; `bun run bench` runs every *.bench.ts suite for a full-baseline run.
