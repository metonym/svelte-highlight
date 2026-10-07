/** A compiled theme: `--shl-*` custom properties plus metadata. */
export interface ThemePalette {
  /** Theme name, matching `svelte-highlight/styles/<name>`. */
  name: string;
  /** Inferred from the theme's background luminance. */
  colorScheme: "light" | "dark";
  /** `--shl-*` custom property values. */
  vars: Record<`--shl-${string}`, string>;
  /** Raw CSS that doesn't fit `--shl-*` vars (e.g. gradients). Only applied
   * via the `.css` artifact, not inline. */
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

/** Semantic roles that `defineTheme()` expands into `--shl-*` scope vars
 * (see `ROLE_SCOPES`). */
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
  /** @default "custom-theme" */
  name?: string;
  /** Default: inferred from the resolved background's luminance. */
  colorScheme?: "light" | "dark";
  /** Start from an existing palette's vars. */
  extends?: ThemePalette;
  /** Semantic role colors, expanded via `ROLE_SCOPES`. */
  roles?: Partial<Record<ThemeRole, string | TokenStyle>>;
  /** Raw hljs scope keys applied over `roles`, e.g. `"title.function_"`
   * or `"meta keyword"` (descendant). */
  scopes?: Record<string, string | TokenStyle>;
}

/**
 * Build a complete `ThemePalette` from semantic `roles` and optional
 * `scopes` overrides. `foreground`/`background` are required without
 * `extends`.
 */
export function defineTheme(definition: ThemeDefinition): ThemePalette;

/** Shorthand for `defineTheme({ ...overrides, extends: base })`. */
export function extendTheme(
  base: ThemePalette,
  overrides: Omit<ThemeDefinition, "extends">,
): ThemePalette;

export interface PaletteToCssOptions {
  /** CSS selector for the scoped block. Default `[data-shl-theme="<name>"]`. */
  selector?: string;
  /** Whether to also apply the vars to `:root`. Default `true`. */
  root?: boolean;
}

/**
 * Emit a palette as CSS in the same format as the generated
 * `themes/<name>.css`, including `extras`.
 */
export function paletteToCss(
  palette: ThemePalette,
  options?: PaletteToCssOptions,
): string;

/**
 * Return warnings for common palette mistakes (missing or malformed vars,
 * unrecognized fg/bg colors); `[]` when clean. Never throws.
 */
export function validatePalette(palette: ThemePalette): string[];

/** `ThemeRole` -> hljs scope keys used by `roles`. Read-only. */
export const ROLE_SCOPES: Record<
  Exclude<ThemeRole, "foreground" | "background">,
  string[]
>;
