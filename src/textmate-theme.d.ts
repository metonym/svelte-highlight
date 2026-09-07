import type { ThemePalette } from "./theme.d.ts";

export interface TextMateTokenColor {
  scope?: string | string[];
  settings: {
    foreground?: string;
    background?: string;
    fontStyle?: string;
  };
}

/** One `semanticTokenColors` entry's value, VS Code's actual shape —
 * distinct fields from `tokenColors`' `settings.fontStyle` string. */
export interface TextMateSemanticTokenStyle {
  foreground?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}

/** A parsed VS Code / TextMate theme JSON object. JSONC parsing (comments,
 * trailing commas) is the caller's job — `fromTextMate` accepts plain
 * objects only. */
export interface TextMateTheme {
  name?: string;
  type?: "light" | "dark" | string;
  /** VS Code workbench colors, e.g. `"editor.foreground"`. */
  colors?: Record<string, string>;
  tokenColors?: TextMateTokenColor[];
  /** Semantic highlighting overlay, keyed `"<type>[.modifier...][:language]"`
   * (e.g. `"variable.readonly:typescript"`) — resolved by base type only. */
  semanticTokenColors?: Record<string, string | TextMateSemanticTokenStyle>;
}

export interface FromTextMateOptions {
  /** Called once per unmappable or unsupported `tokenColors` entry —
   * scopes with no starter-table match, and descendant (space-separated)
   * selectors, which aren't supported. Unmappable entries are never
   * silently dropped. */
  onWarn?: (message: string) => void;
}

/**
 * Import a VS Code / TextMate theme into a `ThemePalette`. Scope selectors
 * match by segment-prefix (`"entity.name.function"` matches
 * `"entity.name.function.method.ts"`); when multiple `tokenColors`
 * entries match the same hljs target, the most specific (longest
 * matching) selector wins, ties going to the later entry.
 */
export function fromTextMate(
  theme: TextMateTheme,
  options?: FromTextMateOptions,
): ThemePalette;

/**
 * Convenience wrapper around `fromTextMate` that aggregates every `onWarn`
 * call into a returned `warnings` array, for the common "how many entries
 * mapped" question.
 */
export function fromTextMateWithWarnings(theme: TextMateTheme): {
  palette: ThemePalette;
  warnings: string[];
};
