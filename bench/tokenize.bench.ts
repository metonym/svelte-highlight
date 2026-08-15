/**
 * Core engine tokenize() throughput per language, on real corpora pulled
 * from this repo (see _shared.ts). This is the hottest path in the
 * library: every Highlight render and every candidate scored during
 * auto-detection goes through it.
 */
import { bench, do_not_optimize, group, run, summary } from "mitata";
import { buildRegistry, getCorpus, sizedSlice } from "./_shared.ts";

const registry = await buildRegistry();
const corpus = await getCorpus();

const SIZES = [2_000, 20_000, 200_000];

group("engine.tokenize()", () => {
  summary(() => {
    for (const language of Object.keys(corpus) as (keyof typeof corpus)[]) {
      const full = corpus[language];
      for (const size of SIZES) {
        const code = sizedSlice(full, size);
        bench(`${language} @ ${size.toLocaleString()} chars`, () => {
          do_not_optimize(registry.tokenize(code, language));
        });
      }
    }
  });
});

// Run this suite alone with `bun bench/tokenize.bench.ts` for a fast
// feedback loop; bench/index.ts imports every suite for a full-baseline run.
if (import.meta.main) await run();
