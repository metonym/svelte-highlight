import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ThemePalette } from "./theme.d.ts";

export type HighlightStyleProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Theme CSS from `svelte-highlight/styles/<theme>`, or a `ThemePalette`
   * from `svelte-highlight/themes/<theme>` (applied as inline `--shl-*` vars).
   * @example
   * import a11yDark from "svelte-highlight/styles/a11y-dark";
   * @example
   * import atomOneDark from "svelte-highlight/themes/atom-one-dark";
   */
  theme?: string | ThemePalette;

  /**
   * Light theme; with `dark`, takes precedence over `theme`. Must be the same
   * type as `dark`.
   */
  light?: string | ThemePalette;

  /** Dark theme; pair with `light`. */
  dark?: string | ThemePalette;

  /**
   * How to switch between `light` and `dark`: `"auto"` follows
   * `prefers-color-scheme`, `"light"`/`"dark"` force one, and any other
   * string is a CSS selector that gates dark (e.g. `[data-theme="dark"]`;
   * with palettes, set `color-scheme` on that selector yourself).
   * @default "auto"
   */
  mode?: "auto" | "light" | "dark" | (string & {});

  /**
   * Wrapper class the scoped selectors target. Empty means auto.
   * @default hash of `theme`
   */
  scopeClass?: string;

  /** CSP nonce for the injected `<style>` tag (unused by a single palette). */
  nonce?: string;
};

export type HighlightStyleSlots = {
  default: {
    scopeClass: string;
  };
};

export default class HighlightStyle extends SvelteComponentTyped<
  HighlightStyleProps,
  Record<string, never>,
  HighlightStyleSlots
> {}
