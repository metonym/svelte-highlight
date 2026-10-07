/**
 * A parsed ANSI color: one of the 16 themable names (e.g. `"bright-red"`),
 * a 256-color index (16-255), or a truecolor triple.
 */
export type AnsiColor =
  | { name: string }
  | { index: number }
  | { rgb: [number, number, number] };

/** Active styling while parsing. */
export type AnsiStyle = {
  bold?: boolean | undefined;
  dim?: boolean | undefined;
  italic?: boolean | undefined;
  underline?: boolean | undefined;
  reverse?: boolean | undefined;
  strikethrough?: boolean | undefined;
  conceal?: boolean | undefined;
  fg?: AnsiColor | undefined;
  bg?: AnsiColor | undefined;
};

/** Text run with styling. Omitted fields are inactive. */
export type AnsiSegment = {
  /** Literal text (escape codes stripped). */
  text: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  /** Rendered invisible but kept for layout/copy (SGR 8). */
  conceal?: boolean;
  fg?: AnsiColor;
  bg?: AnsiColor;
  /** OSC 8 hyperlink target; only `http:`, `https:`, and `mailto:` are kept. */
  link?: string;
};

/**
 * Parse ANSI escape codes into styled segments. Malformed or trailing
 * unterminated sequences are dropped; use {@link createAnsiSession} for
 * chunked input.
 */
export declare function parseAnsi(text: string): AnsiSegment[];

/** Changed segments from {@link AnsiSession.delta}. */
export interface AnsiDelta {
  /** Index of the first changed segment. */
  start: number;
  /** Segments from `start` to the end, including the live trailing one. */
  segments: AnsiSegment[];
}

/** An incremental ANSI parser session; see {@link createAnsiSession}. */
export interface AnsiSession {
  /** Feed the next chunk of text into the session. */
  append(chunk: string): void;
  /** Segments so far, including a live trailing segment for buffered text. */
  segments(): AnsiSegment[];
  /**
   * `segments().slice(start)` for the first index changed since the last
   * `delta()`. Mirror by truncating to `start` and appending `segments`.
   */
  delta(): AnsiDelta;
  /** Flush, drop any incomplete sequence, and return the final segments. */
  finish(): AnsiSegment[];
}

/**
 * Incremental {@link parseAnsi} for chunked input; sequences split across
 * chunks are buffered. `finish()` equals `parseAnsi` of the concatenation.
 */
export declare function createAnsiSession(): AnsiSession;
