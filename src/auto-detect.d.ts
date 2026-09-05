/** Tier 0 only: top-k candidate language names, best first. Sync, no grammars loaded. */
export declare function detectCandidates(code: string, k?: number): string[];

/**
 * Tier 0 + tier 1: loads top-k candidate grammars, registers them on the
 * shared registry, and runs the relevance competition among the candidates
 * plus all already-registered languages. When `languageNames` is given,
 * tier 0 is skipped and exactly those names are loaded as candidates.
 */
export declare function detectLanguage(
  code: string,
  options?: { k?: number; languageNames?: string[] },
): Promise<{ language: string | undefined; relevance: number }>;
