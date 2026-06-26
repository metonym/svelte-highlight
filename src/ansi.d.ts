/**
 * A parsed ANSI color.
 *
 * - `name`: one of the 16 themable base colors (e.g. `"red"`, `"bright-red"`).
 * - `index`: a 256-color palette index (16-255); 0-15 are normalized to `name`.
 * - `rgb`: a 24-bit truecolor triple.
 */
export type AnsiColor =
  | { name: string }
  | { index: number }
  | { rgb: [number, number, number] };

/**
 * The active styling state while parsing.
 */
export type AnsiStyle = {
  bold?: boolean | undefined;
  dim?: boolean | undefined;
  italic?: boolean | undefined;
  underline?: boolean | undefined;
  fg?: AnsiColor | undefined;
  bg?: AnsiColor | undefined;
};

/**
 * A run of text sharing the same styling. Attributes are present only when
 * active.
 */
export type AnsiSegment = {
  /** The literal text of this run (escape codes removed). */
  text: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  fg?: AnsiColor;
  bg?: AnsiColor;
};

/**
 * Parse terminal output containing ANSI SGR escape codes into styled segments.
 * Unsupported or malformed escape sequences are dropped, not thrown.
 *
 * @param text Raw terminal output.
 * @returns Styled text segments, in order.
 */
export declare function parseAnsi(text: string): AnsiSegment[];
