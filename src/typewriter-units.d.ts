export interface TypewriterUnit {
  raw: string;
  visible: 0 | 1;
  kind?: "open" | "close" | "self";
  name?: string;
}

/**
 * Splits highlighted HTML into units: whole tags (zero visible chars) or
 * single visible chars (a surrogate pair or HTML entity counts as one).
 */
export declare function tokenizeTypewriter(html: string): TypewriterUnit[];

/** Wraps each visible unit in a `typewriter-unit typewriter-hidden` span. */
export declare function buildUnitMarkup(units: TypewriterUnit[]): string;

export interface TypewriterSplitter {
  splitAt(count: number): { head: string; tail: string };
}

/**
 * Incremental splitter: non-decreasing `splitAt(count)` calls cost O(n)
 * total; a lower `count` replays from the start.
 */
export declare function createTypewriterSplitter(
  units: TypewriterUnit[],
  html: string,
): TypewriterSplitter;

/**
 * Cumulative visible-unit count at the end of each word (a non-whitespace
 * run plus trailing whitespace). Tags are skipped; the last entry equals the
 * total.
 */
export declare function computeWordBoundaries(
  units: TypewriterUnit[],
): number[];
