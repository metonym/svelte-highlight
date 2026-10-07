/** tokenizeAuto() over the full registry vs a small subset (sample is capped internally). */
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
