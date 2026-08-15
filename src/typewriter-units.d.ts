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
