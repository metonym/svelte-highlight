import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ThemePalette } from "./theme.d.ts";

export type HighlightStyleProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Theme CSS from `svelte-highlight/styles/<theme>`, or a `ThemePalette`
   * from `svelte-highlight/themes/<theme>` — the latter is applied by
   * inlining `--shl-*` vars on the wrapper element instead of injecting a
   * scoped `<style>` tag.
   * @example
   * import a11yDark from "svelte-highlight/styles/a11y-dark";
   * @example
   * import atomOneDark from "svelte-highlight/themes/atom-one-dark";
   */
  theme?: string | ThemePalette;

  /**
   * Light theme CSS/palette; pair with `dark` to emit both and switch
   * automatically. Takes precedence over `theme` when both `light` and `dark`
   * are provided. Must be the same type (string or `ThemePalette`) as `dark`.
   */
  light?: string | ThemePalette;

  /**
   * Dark theme CSS/palette; pair with `light`.
   */
  dark?: string | ThemePalette;

  /**
   * How to switch between `light` and `dark`.
   *
   * String path: `"auto"` uses `prefers-color-scheme` media queries,
   * `"light"`/`"dark"` force a single theme, and any other string is a CSS
   * selector that gates the dark block (e.g. `[data-theme="dark"]`).
   *
   * `ThemePalette` path: `"auto"` inlines `color-scheme: light dark` (vars
   * resolve via `light-dark()`), `"light"`/`"dark"` force that
   * `color-scheme`, and any other string omits `color-scheme` — set it on
   * your own selector for app-controlled switching.
   * @default "auto"
   */
  mode?: "auto" | "light" | "dark" | (string & {});

  /**
   * Wrapper class the scoped selectors target. Inert on the `ThemePalette`
   * path (kept for back-compat / slot access).
   * @default hash of `theme`
   */
  scopeClass?: string;
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
