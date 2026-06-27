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

/** Active styling while parsing. */
export type AnsiStyle = {
  bold?: boolean | undefined;
  dim?: boolean | undefined;
  italic?: boolean | undefined;
  underline?: boolean | undefined;
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
  fg?: AnsiColor;
  bg?: AnsiColor;
};

/** Parse ANSI SGR escape codes into styled segments. Malformed input is dropped. */
export declare function parseAnsi(text: string): AnsiSegment[];
