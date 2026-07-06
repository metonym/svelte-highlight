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
