import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type HighlightStyleProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Theme CSS from `svelte-highlight/styles/<theme>`.
   * @example
   * import a11yDark from "svelte-highlight/styles/a11y-dark";
   */
  theme: string;

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
