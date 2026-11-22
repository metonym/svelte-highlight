import type { ScopeEvent } from "./engine";
import type { ThemePalette } from "./theme";

/**
 * A run of text and how the theme styles it. Colors are CSS color values
 * as the theme writes them (usually hex). Flags are only present when set.
 */
export interface StyledToken {
  /** Token text; never contains a line break. */
  text: string;
  /** Open scope stack, outermost first, as in `tokenLines`. */
  scopes: string[];
  /** Text color. Missing only when the theme leaves text uncolored. */
  color?: string;
  /** Background behind this token, when it differs from the block's. */
  background?: string;
  bold?: true;
  italic?: true;
  underline?: true;
  strikethrough?: true;
}

export interface StyledLines {
  /** The block's text color (`.hljs` `color`). */
  foreground?: string;
  /** The block's background (`.hljs` `background`). */
  background?: string;
  /** Line-indexed tokens, split only on LF like `tokenLines`. */
  lines: StyledToken[][];
}

export interface TokenStyler {
  foreground?: string;
  background?: string;
  /** Styles `events`, reusing the theme's resolved styles across calls. */
  lines(events: ScopeEvent[]): StyledToken[][];
}

export interface TokenStylerOptions {
  /**
   * Text color for themes that leave `.hljs` uncolored or use
   * `currentColor`, standing in for the page's color.
   */
  color?: string;
}

/**
 * Resolves `theme` once, for styling many event streams.
 *
 * @example
 * ```js
 * import { createTokenStyler } from "svelte-highlight/styled-tokens";
 * import github from "svelte-highlight/themes/github";
 *
 * const styler = createTokenStyler(github);
 * const lines = styler.lines(events);
 * ```
 */
export function createTokenStyler(
  theme: string | ThemePalette,
  options?: TokenStylerOptions,
): TokenStyler;

/** One-off `createTokenStyler(theme, options).lines(events)`. */
export function styleTokens(
  events: ScopeEvent[],
  theme: string | ThemePalette,
  options?: TokenStylerOptions,
): StyledLines;

export interface ToAnsiOptions {
  /** Also paint the theme's background behind text with none of its own. */
  background?: boolean;
}

/**
 * Styled lines as a string for a true-color terminal, with SGR escapes for
 * each token's color, background, bold, italic, underline and
 * strikethrough. Colors a terminal can't take (`color-mix()`) keep the
 * terminal's own.
 *
 * @example
 * ```js
 * console.log(toAnsi(styleTokens(events, github)));
 * ```
 */
export function toAnsi(
  styled: Pick<StyledLines, "lines" | "foreground" | "background">,
  options?: ToAnsiOptions,
): string;
