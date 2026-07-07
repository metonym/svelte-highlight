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
  /** Strikethrough (SGR 9). */
  strikethrough?: boolean;
  /** Text is present for layout/copy but rendered invisible (SGR 8). */
  conceal?: boolean;
  fg?: AnsiColor;
  bg?: AnsiColor;
  /** OSC 8 hyperlink target for this run, if any. */
  link?: string;
};

/** Parse ANSI SGR escape codes into styled segments. Malformed input is dropped. */
export declare function parseAnsi(text: string): AnsiSegment[];
