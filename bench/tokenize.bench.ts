/** Core tokenize() throughput per language on real corpora. */
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

// Stresses keyword lookup rather than rule scanning (SQL also lowercases).
const KEYWORD_DENSE = {
  sql:
    "SELECT name, total_amount, created_at FROM orders o INNER JOIN customers c " +
    "ON o.customer_id = c.id WHERE status IS NOT NULL AND region IN (north, south) " +
    "GROUP BY name ORDER BY created_at DESC;\n",
  python:
    "def compute(values, factor):\n" +
    "    result = [value for value in values if value is not None and value > factor]\n" +
    "    return sorted(result, key=lambda item: item, reverse=True)\n",
};

group("engine.tokenize() keyword-dense", () => {
  for (const [language, unit] of Object.entries(KEYWORD_DENSE)) {
    const code = sizedSlice(unit, 20_000);
    task(`${language} @ 20,000 chars`, () => registry.tokenize(code, language));
  }
});
