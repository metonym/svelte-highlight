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
   * Treat `text` as a regular expression source instead of literal text.
   * Capped at 256 characters; over the cap, or an invalid pattern, yields
   * zero matches and sets `error()`.
   * @default false
   */
  regex?: boolean;
  /** @default false */
  caseSensitive?: boolean;
  /** Wraps the pattern in `\b...\b`. @default false */
  wholeWord?: boolean;
}

/**
 * A plain string (split on `"\n"`), an array of lines used as-is, or a
 * duck-typed `TokenizedDocument` (only `lineCount`/`lineRange` are used;
 * never checked via `instanceof`) whose highlighted-HTML lines are decoded
 * back to plain text before matching.
 */
export type SearchSource =
  | string
  | string[]
  | Pick<TokenizedDocument, "lineCount" | "lineRange">;

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
 * Headless find-in-document search over a plain string, a line array, or a
 * `TokenizedDocument` (incrementally rescanning only newly appended lines
 * when the same query is repeated against a grown document).
 */
export declare function createSearch(source: SearchSource): Search;
