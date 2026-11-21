import type { HighlightResult, Registry } from "./engine.d.ts";
import type { LanguageName } from "./languages";

/** How many fingerprint candidates `highlightAutoLazy` loads by default. */
export declare const DEFAULT_CANDIDATES: number;

export interface LazyAutoOptions {
  /**
   * How many fingerprint candidates to load. Ignored when
   * `languageNames` is set.
   * @default 5
   */
  k?: number;

  /**
   * Detect among these grammars only, and skip the fingerprint step.
   * Use canonical names (`"javascript"`, not `"js"`).
   */
  languageNames?: (LanguageName | (string & {}))[];

  /**
   * Registry to load grammars into and detect with.
   * @default the shared registry from `svelte-highlight/registry`
   */
  registry?: Registry;
}

/**
 * Scores `code` against the fingerprint index and returns up to `k`
 * likely grammar names, best first. Loads no grammars.
 */
export declare function detectCandidates(code: any, k?: number): string[];

/**
 * Loads the fingerprint candidates (and the grammars they embed),
 * registers them, then runs `registry.highlightAuto` over the candidates
 * plus every grammar already registered. A grammar that fails to load
 * drops out.
 */
export declare function highlightAutoLazy(
  code: any,
  options?: LazyAutoOptions,
): Promise<HighlightResult>;

/**
 * Same as `highlightAutoLazy`, but loads nothing. Returns `undefined`
 * when a grammar it needs is not registered yet. Works during SSR.
 */
export declare function highlightAutoIfLoaded(
  code: any,
  options?: LazyAutoOptions,
): HighlightResult | undefined;
