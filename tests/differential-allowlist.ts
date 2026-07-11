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
