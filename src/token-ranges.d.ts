export interface TokenRange {
  /** Character offset into `code` where the token starts. */
  start: number;
  /** Character offset into `code` where the token ends. */
  end: number;
  /**
   * hljs scope name (e.g. `"keyword"`, `"title.function"`), as passed to
   * `startScope`. Dotted/tiered names are kept as-is, not split into
   * multiple classes.
   */
  scope: string;
}

/**
 * Tokenize `code` into flat, non-overlapping scope ranges instead of HTML.
 * `languageName` must already be registered with hljs.
 */
export function tokenize(code: string, languageName: string): TokenRange[];
