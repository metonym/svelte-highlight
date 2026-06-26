import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type HighlightStyleProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Theme CSS from `svelte-highlight/styles/<theme>`.
   * @example
   * import a11yDark from "svelte-highlight/styles/a11y-dark";
   */
  theme?: string;

  /**
   * Light theme CSS; pair with `dark` to emit both stylesheets and switch
   * automatically. Takes precedence over `theme` when both `light` and `dark`
   * are provided.
   */
  light?: string;

  /**
   * Dark theme CSS; pair with `light` to emit both stylesheets.
   */
  dark?: string;

  /**
   * How to switch between `light` and `dark`:
   * `"auto"` uses `prefers-color-scheme` media queries, `"light"`/`"dark"`
   * force a single theme, and any other string is a CSS selector that gates
   * the dark block (e.g. `[data-theme="dark"]`).
   * @default "auto"
   */
  mode?: "auto" | "light" | "dark" | (string & {});

  /**
   * Wrapper class the scoped selectors target.
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
