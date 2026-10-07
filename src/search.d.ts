import type { TokenizedDocument } from "./tokenized-document.js";

export interface SearchMatch {
  /** 0-indexed line number. */
  line: number;
  /** Start offset into the line's plain text (inclusive). */
  start: number;
  /** End offset into the line's plain text (exclusive). */
  end: number;
}

export interface SearchOptions {
  /**
   * Treat `text` as a regex (max 256 chars). An invalid or over-long pattern
   * yields zero matches and sets `error()`.
   * @default false
   */
  regex?: boolean;
  /** @default false */
  caseSensitive?: boolean;
  /** Wraps the pattern in `\b...\b`. @default false */
  wholeWord?: boolean;
}

/**
 * A string (split on `"\n"`), an array of lines, or a duck-typed
 * `TokenizedDocument` (plain text via `textRange`, else stripped `lineRange` HTML).
 */
export type SearchSource =
  | string
  | string[]
  | (Pick<TokenizedDocument, "lineCount" | "lineRange"> &
      Partial<Pick<TokenizedDocument, "textRange">>);

export interface Search {
  /** Runs a new search. Empty `text` clears matches without an error. */
  query(text: string, options?: SearchOptions): void;
  /** All matches, in document order. Same array identity until the next mutation. */
  matches(): readonly SearchMatch[];
  /** `matches().length`. */
  count(): number;
  /** Set when the last `query()` couldn't compile its pattern. */
  error(): string | undefined;
  /** The currently selected match, or `undefined` before any query or with zero matches. */
  current(): (SearchMatch & { index: number }) | undefined;
  /** Advances to (and returns) the next match, wrapping around the end. */
  next(): (SearchMatch & { index: number }) | undefined;
  /** Moves to (and returns) the previous match, wrapping around the start. */
  prev(): (SearchMatch & { index: number }) | undefined;
  /** Replaces the source and re-runs an already-active query as a full rescan. */
  setSource(source: SearchSource): void;
  /** Runs `callback` after every mutating call. Returns an unsubscribe function. */
  onChange(callback: () => void): () => void;
}

/**
 * Headless find-in-document search. Repeating a query on a grown
 * `TokenizedDocument` only scans the appended lines.
 */
export declare function createSearch(source: SearchSource): Search;

export interface HighlightMatchesOptions {
  /** 0-based index into `matches` of the selected ("current") match. */
  current?: number;
  /**
   * Name registered with `CSS.highlights` (and `${name}-current` for the
   * current match). A custom name bypasses `search.css`'s built-in rules.
   * @default "shl-search"
   */
  name?: string;
}

/**
 * Paints `matches` into the rows currently rendered in `root` (found via
 * `[data-line]`, then `.line`, then `<code>`), using the CSS Custom Highlight
 * API or else `<mark data-shl-search>`. No-op on the server. Paints once;
 * `dispose()` and re-run to repaint.
 */
export declare function highlightMatches(
  root: Element,
  matches: readonly SearchMatch[],
  options?: HighlightMatchesOptions,
): { dispose(): void };
