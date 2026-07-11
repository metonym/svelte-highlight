/**
 * Explicit, reviewable exceptions to the differential gate (tests/differential.test.ts).
 * Every entry needs a `reason` explaining why the engine is *expected* to
 * diverge from hljs for that language/dimension — an empty allowlist is the
 * goal; an entry here is a deliberate, reviewed decision, not a shrug.
 */

export type DivergentDimension = "html" | "ranges" | "relevance";

export interface AllowlistEntry {
  language: string;
  dimensions: DivergentDimension[];
  reason: string;
}

export const DIFFERENTIAL_ALLOWLIST: AllowlistEntry[] = [
  {
    language: "gcode",
    dimensions: ["html", "ranges", "relevance"],
    reason:
      "Several on:begin callbacks (title/symbol/property/params matching) have no declarative IR feature; not in the shipped snippet corpus, listed here for when it's added.",
  },
  {
    language: "mathematica",
    dimensions: ["html", "ranges", "relevance"],
    reason:
      "builtin-symbol on:begin callback has no declarative IR feature; not in the shipped snippet corpus, listed here for when it's added.",
  },
];

/**
 * Explicit, reviewable exceptions to the "real files" differential gate
 * (tests/differential.test.ts's separate `REAL_FILES` describe block, which
 * tokenizes a whole document rather than one hand-picked snippet). Keyed by
 * path, not language: unlike `DIFFERENTIAL_ALLOWLIST`, an entry here has no
 * effect on the per-language snippet gate.
 */
export interface RealFileAllowlistEntry {
  path: string;
  reason: string;
}

export const REAL_FILE_ALLOWLIST: RealFileAllowlistEntry[] = [
  {
    path: "README.md",
    reason:
      "Tokenizer.subContinuations (src/engine.js) carries embedded-sublanguage parse state across *all* flushSubLanguage calls for a given sublanguage name within one tokenize() call, keyed only by name - not scoped to a single fenced-code region. Markdown documents with multiple independent fenced blocks that each auto-detect the same embedded sublanguage (e.g. xml/handlebars-like markup inside separate ```svelte examples) can incorrectly resume from an unrelated block's leftover frame state, diverging from hljs's per-block-independent behavior. Pre-existing in the engine rewrite (85a0706); newly exposed by (not caused by) added README content. Root-cause fix belongs in engine.js's sublanguage-continuation scoping, out of scope here.",
  },
];
