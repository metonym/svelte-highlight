export interface TypewriterUnit {
  raw: string;
  visible: 0 | 1;
  kind?: "open" | "close" | "self";
  name?: string;
}

/**
 * Splits highlight.js output HTML into typing units: HTML tags carry zero
 * visible chars and are never split; text is grouped one visible char per
 * unit (a surrogate pair or an HTML entity counts as a single char).
 */
export declare function tokenizeTypewriter(html: string): TypewriterUnit[];

/**
 * Renders `units` into HTML once: tags pass through unchanged, each visible
 * unit is wrapped in a `typewriter-unit typewriter-hidden` span.
 */
export declare function buildUnitMarkup(units: TypewriterUnit[]): string;

export interface TypewriterSplitter {
  splitAt(count: number): { head: string; tail: string };
}

/**
 * Stateful incremental splitter: repeated `splitAt(count)` calls with a
 * non-decreasing `count` cost O(n) total instead of O(n^2). A `count` lower
 * than the last one served resets and replays from the start.
 */
export declare function createTypewriterSplitter(
  units: TypewriterUnit[],
  html: string,
): TypewriterSplitter;

/**
 * Groups `units`' visible characters into words: a maximal run of
 * consecutive non-whitespace visible units, plus any visible whitespace
 * (` `, `\t`, `\r`, `\n`) immediately following it. A leading whitespace run
 * (with no preceding word) is its own word. Tags (`visible: 0`) are skipped
 * without resetting the current word. Returns the cumulative visible-unit
 * count at the end of each word; the last entry always equals the total
 * visible-unit count. Empty for zero visible units.
 */
export declare function computeWordBoundaries(
  units: TypewriterUnit[],
): number[];
