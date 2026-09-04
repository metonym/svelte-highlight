/**
 * tokenizeAuto() scores every registered (non-disableAutodetect) language
 * candidate against a code sample - O(numLanguages) per call, and the
 * engine backing HighlightAuto. Compares scanning the full registry
 * (~200+ languages) against a small realistic subset, at a couple of
 * sample sizes (tokenizeAuto caps the scored sample at DETECT_SAMPLE_LIMIT
 * internally, so larger inputs shouldn't scale the per-candidate cost).
 */
import { group, task } from "ostia";
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
  for (const size of SIZES) {
    const code = sizedSlice(corpus.javascript, size);
    task(
      `full registry (${allLanguages.length} langs) @ ${size.toLocaleString()} chars`,
      () => registry.tokenizeAuto(code),
    );
    task(
      `common subset (${commonSubset.length} langs) @ ${size.toLocaleString()} chars`,
      () => registry.tokenizeAuto(code, commonSubset),
    );
  }
});

// Run this suite with `ostia bench bench/auto-detect.bench.ts` for a fast
// feedback loop; `bun run bench` runs every *.bench.ts suite for a full-baseline run.
