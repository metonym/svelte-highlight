/**
 * Core engine tokenize() throughput per language, on real corpora pulled
 * from this repo (see _shared.ts). This is the hottest path in the
 * library: every Highlight render and every candidate scored during
 * auto-detection goes through it.
 */
import { group, task } from "ostia";
import { buildRegistry, getCorpus, sizedSlice } from "./_shared.ts";

const registry = await buildRegistry();
const corpus = await getCorpus();

const SIZES = [2_000, 20_000, 200_000];

group("engine.tokenize()", () => {
  for (const language of Object.keys(corpus) as (keyof typeof corpus)[]) {
    const full = corpus[language];
    for (const size of SIZES) {
      const code = sizedSlice(full, size);
      task(`${language} @ ${size.toLocaleString()} chars`, () =>
        registry.tokenize(code, language),
      );
    }
  }
});

// Run this suite with `ostia bench bench/tokenize.bench.ts` for a fast
// feedback loop; `bun run bench` runs every *.bench.ts suite for a full-baseline run.
