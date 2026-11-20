import { createRegistry, registerAll } from "../src/engine.js";
import allLanguages from "../src/languages/all.js";
import { SAMPLES } from "./detection-corpus.ts";

// A private registry, so the candidate order is always all.js order.
// Ties go to the first candidate, and other test files fill the shared
// registry in whatever order Bun happens to run them.
const registry = createRegistry();
for (const language of allLanguages) registerAll(registry, language);

// Samples from tests/detection-corpus.ts, scored against the FULL
// unrestricted candidate pool (all registered grammars) via
// `highlightAuto` - the scenario a consumer gets by default, without
// restricting `languageNames`.
//
// Deliberate, reviewable record of samples that do NOT yet win
// full-corpus auto-detection (an unrelated, higher-scoring grammar wins
// instead) - most commonly because the language's own relevance signal
// (keyword/structural matches) is modest while some other registered
// grammar's broader, more generic rules pick up incidental relevance on the
// same text (e.g. any `@word`-prefixed syntax scores non-trivially for
// blade's directive rule, regardless of what `@word` actually means in the
// sample's own language). This is a real accuracy gap in `HighlightAuto`
// for custom/niche languages against the full unrestricted candidate pool,
// not a conversion bug like the mathematica/gcode relevance fix nearby in
// this test suite - `languageNames` restriction (see
// tests/highlight-auto-candidate-selection.test.ts) is the reliable way to
// auto-detect among a known, narrower set of these languages today.
// Move a language OUT of this set (and let its assertion below flip to
// "wins") once a grammar/relevance change fixes it; a language unexpectedly
// disappearing from FAIL here (without being removed from this set) will
// fail loudly instead of silently improving unnoticed.
const KNOWN_AUTO_DETECT_GAPS = new Set([
  "prisma",
  "hcl",
  "bibtex",
  "bicep",
  "caddy",
  "clarity",
  "cue",
  "cypher",
  "d2",
  "dax",
  "dhall",
  "dotenv",
  "gleam",
  "groq",
  "jinja",
  "jsonnet",
  "just",
  "kql",
  "liquid",
  "logql",
  "mermaid",
  "move",
  "nickel",
  "nushell",
  "odin",
  "pkl",
  "promql",
  "razor",
  "rego",
  "rescript",
  "starlark",
  "traceql",
  "typst",
  "v",
  "vyper",
  "wgsl",
  "zig",
]);

describe("HighlightAuto detection accuracy across custom languages (full 244-candidate pool)", () => {
  for (const [expected, code] of Object.entries(SAMPLES)) {
    if (KNOWN_AUTO_DETECT_GAPS.has(expected)) {
      it(`${expected}: known gap, does not yet win full-corpus auto-detect`, () => {
        const result = registry.highlightAuto(code);
        expect(result.language).not.toBe(expected);
      });
    } else {
      it(`${expected}: wins full-corpus auto-detect`, () => {
        const result = registry.highlightAuto(code);
        expect(result.language).toBe(expected);
      });
    }
  }

  it("every sample restricted to just itself always detects correctly", () => {
    // Sanity check: each language's own sample is unambiguous when it's the
    // only candidate - the gaps above are strictly about cross-language
    // relevance competition, not the samples themselves being unrecognizable.
    for (const [expected, code] of Object.entries(SAMPLES)) {
      const result = registry.highlightAuto(code, [expected]);
      expect(result.language).toBe(expected);
    }
  });
});
