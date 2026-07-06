/**
 * Splits highlight.js output HTML into lines, closing any `<span>` elements
 * left open at a line break and reopening the same stack (in order) on the
 * next line.
 */
export declare function splitLines(html: string): string[];
