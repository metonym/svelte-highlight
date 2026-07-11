/**
 * A compiled highlight.js theme: a flat map of `--shl-*` custom properties
 * plus metadata. See `svelte-highlight/themes` and `themes/base.css`.
 */
export interface ThemePalette {
  /** Theme name, matching `svelte-highlight/styles/<name>`. */
  name: string;
  /** Inferred from the theme's background luminance. */
  colorScheme: "light" | "dark";
  /** `--shl-*` custom property values, applied inline by `HighlightStyle`
   * or via `svelte-highlight/themes/<name>.css`. */
  vars: Record<`--shl-${string}`, string>;
  /** Raw CSS for declarations that don't fit the `--shl-*` var contract
   * (e.g. `background-image` gradients). Applied only via the `.css`
   * artifact; ignored by the inline (`HighlightStyle`/`HighlightEditable`
   * palette-object) path. */
  extras?: string;
}

/** One scope's styling. A bare `string` (in `ThemeDefinition`) is shorthand
 * for `{ color: string }`. */
export interface TokenStyle {
  color?: string;
  background?: string;
  fontStyle?: "italic" | "normal";
  fontWeight?: string;
  textDecoration?: string;
}

/** The ~14-key semantic layer `defineTheme()`'s `roles` expand into a full
 * set of `--shl-*` scope variables. See the role -> scope table in
 * `src/theme.js`. */
export type ThemeRole =
  | "foreground"
  | "background"
  | "comment"
  | "keyword"
  | "string"
  | "literal"
  | "function"
  | "type"
  | "variable"
  | "property"
  | "tag"
  | "punctuation"
  | "meta"
  | "addition"
  | "deletion";

export interface ThemeDefinition {
  /** Theme name, matching `svelte-highlight/styles/<name>`. Default
   * `"custom-theme"`. */
  name?: string;
  /** Default: inferred from the resolved background's luminance. */
  colorScheme?: "light" | "dark";
  /** Start from an existing palette's vars (any shipped or user
   * `ThemePalette`). */
  extends?: ThemePalette;
  /** Semantic roles, expanded to `--shl-*` scope variables via a
   * documented mapping table. */
  roles?: Partial<Record<ThemeRole, string | TokenStyle>>;
  /** Raw hljs scope keys for per-scope precision on top of `roles` — e.g.
   * `"title.function_"` (compound, dot-separated) or `"meta keyword"`
   * (descendant, space-separated). */
  scopes?: Record<string, string | TokenStyle>;
}

/**
 * Build a complete `ThemePalette` from a small typed definition: a
 * semantic `roles` layer (pick a dozen colors, get a full theme) plus
 * optional per-scope `scopes` overrides.
 *
 * Precedence (low -> high): `extends` palette vars -> `roles` expansion ->
 * `scopes` overrides. `foreground`/`background` roles are required when
 * `extends` is omitted.
 */
export function defineTheme(definition: ThemeDefinition): ThemePalette;

/**
 * Derive a new palette from any shipped or user palette with role- or
 * scope-level overrides. Equivalent to
 * `defineTheme({ ...overrides, extends: base })`.
 */
export function extendTheme(
  base: ThemePalette,
  overrides: Omit<ThemeDefinition, "extends">,
): ThemePalette;

export interface PaletteToCssOptions {
  /** CSS selector for the scoped block. Default `[data-shl-theme="<name>"]`. */
  selector?: string;
  /** Whether to also emit a `:root { … }` block. Default `true`. */
  root?: boolean;
}

/**
 * Emit a palette as a CSS string (`:root` and/or `[data-shl-theme=…]`
 * blocks), matching the format of the generated `themes/<name>.css`
 * artifacts. Includes `extras` verbatim when present.
 */
export function paletteToCss(
  palette: ThemePalette,
  options?: PaletteToCssOptions,
): string;
