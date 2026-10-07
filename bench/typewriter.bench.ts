/** typewriter-units.js: tokenizeTypewriter, buildUnitMarkup, and splitAt per revealed unit. */
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
