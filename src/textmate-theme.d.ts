import type { ThemePalette } from "./theme.d.ts";

export interface TextMateTokenColor {
  scope?: string | string[];
  settings: {
    foreground?: string;
    background?: string;
    fontStyle?: string;
  };
}

/** One `semanticTokenColors` entry's value. */
export interface TextMateSemanticTokenStyle {
  foreground?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}

/** A parsed VS Code / TextMate theme (JSONC parsing is the caller's job). */
export interface TextMateTheme {
  name?: string;
  type?: "light" | "dark" | string;
  /** VS Code workbench colors, e.g. `"editor.foreground"`. */
  colors?: Record<string, string>;
  tokenColors?: TextMateTokenColor[];
  /** Semantic highlighting overlay; keys resolve by base type only. */
  semanticTokenColors?: Record<string, string | TextMateSemanticTokenStyle>;
}

export interface FromTextMateOptions {
  /** Called once per unmapped scope or unsupported descendant selector. */
  onWarn?: (message: string) => void;
}

/**
 * Import a VS Code / TextMate theme into a `ThemePalette`. Scopes match by
 * segment prefix; the most specific match wins, ties going to the later
 * entry.
 */
export function fromTextMate(
  theme: TextMateTheme,
  options?: FromTextMateOptions,
): ThemePalette;

/** `fromTextMate` that collects `onWarn` messages into `warnings`. */
export function fromTextMateWithWarnings(theme: TextMateTheme): {
  palette: ThemePalette;
  warnings: string[];
};
