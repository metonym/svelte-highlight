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

export const DIFFERENTIAL_ALLOWLIST: AllowlistEntry[] = [];

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

export const REAL_FILE_ALLOWLIST: RealFileAllowlistEntry[] = [];
