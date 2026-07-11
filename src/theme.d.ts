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
