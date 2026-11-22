import type { Component, Snippet } from "svelte";
import type { ScopeEvent } from "./engine";
import type { LanguageType } from "./languages";
import type { StyledToken } from "./styled-tokens";
import type { ThemePalette } from "./theme";

export interface HighlightTokensBlock {
  /** Line-indexed tokens, split only on LF like `tokenLines`. */
  lines: StyledToken[][];
  /** The scope-event stream the lines come from. */
  events: ScopeEvent[];
  /** The theme's text color, or `color`. */
  foreground?: string;
  /** The theme's background. */
  background?: string;
}

export interface HighlightTokensProps {
  /** Code to highlight. */
  code: any;

  /** Grammar from `svelte-highlight/languages/*`. */
  language: LanguageType<string>;

  /**
   * Theme CSS (`svelte-highlight/styles/*`) or a `ThemePalette`
   * (`svelte-highlight/themes/*`). Without it, tokens carry only `text`
   * and `scopes`.
   */
  theme?: string | ThemePalette;

  /** Text color for themes that leave text uncolored. */
  color?: string;

  /** Renders one line of tokens. Used when `children` is not set. */
  line?: Snippet<[tokens: StyledToken[], index: number]>;

  /** Renders the whole block. Takes precedence over `line`. */
  children?: Snippet<[block: HighlightTokensBlock]>;
}

/**
 * Highlights `code` into styled tokens and renders them only through your
 * snippets. It has no markup of its own, so it works with Svelte custom
 * renderers (terminals, canvas, PDF, native views) as well as the DOM.
 * Svelte 5 only.
 */
declare const HighlightTokens: Component<HighlightTokensProps>;
export default HighlightTokens;
