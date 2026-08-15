/**
 * tokenizeAuto() scores every registered (non-disableAutodetect) language
 * candidate against a code sample - O(numLanguages) per call, and the
 * engine backing HighlightAuto. Compares scanning the full registry
 * (~200+ languages) against a small realistic subset, at a couple of
 * sample sizes (tokenizeAuto caps the scored sample at DETECT_SAMPLE_LIMIT
 * internally, so larger inputs shouldn't scale the per-candidate cost).
 */
import { bench, do_not_optimize, group, run, summary } from "mitata";
import { buildRegistry, getCorpus, sizedSlice } from "./_shared.ts";

const registry = await buildRegistry();
const corpus = await getCorpus();
const allLanguages = registry.listLanguages();
const commonSubset = [
  "javascript",
  "typescript",
  "css",
  "markdown",
  "html",
  "json",
  "python",
  "bash",
];

const SIZES = [500, 5_000, 50_000];

group("registry.tokenizeAuto()", () => {
  summary(() => {
    for (const size of SIZES) {
      const code = sizedSlice(corpus.javascript, size);
      bench(
        `full registry (${allLanguages.length} langs) @ ${size.toLocaleString()} chars`,
        () => {
          do_not_optimize(registry.tokenizeAuto(code));
        },
      );
      bench(
        `common subset (${commonSubset.length} langs) @ ${size.toLocaleString()} chars`,
        () => {
          do_not_optimize(registry.tokenizeAuto(code, commonSubset));
        },
      );
    }
  });
});

// Run this suite alone with `bun bench/auto-detect.bench.ts` for a fast
// feedback loop; bench/index.ts imports every suite for a full-baseline run.
if (import.meta.main) await run();
