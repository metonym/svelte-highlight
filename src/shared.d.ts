import type { HTMLAttributes } from "svelte/elements";
import type { LanguageType } from "./languages";

export interface Props extends HTMLAttributes<HTMLPreElement> {
  /**
   * Specify the text to highlight.
   */
  code: any;

  /**
   * Provide the language grammar used to highlight the code.
   * Import languages from `svelte-highlight/languages/*`.
   * @example
   * import typescript from "svelte-highlight/languages/typescript";
   */
  language: LanguageType<string>;

  /**
   * Set to `true` for the language name to be
   * displayed at the top right of the code block.
   *
   * Use style props to customize styles:
   * - `--langtag-background`
   * - `--langtag-color`
   * - `--langtag-border-radius`
   *
   * @default false
   */
  langtag?: boolean;

  /**
   * Customize the background color of the langtag.
   */
  "--langtag-background"?: string;

  /**
   * Customize the text color of the langtag.
   */
  "--langtag-color"?: string;

  /**
   * Customize the border radius of the langtag.
   */
  "--langtag-border-radius"?: string;
}

export interface HighlightedCode {
  /**
   * The highlighted HTML as a string.
   * @example "<span>...</span>"
   */
  highlighted: string;
}

export interface Slots {
  default: HighlightedCode;
}

export interface Events<THighlight = HighlightedCode> {
  highlight: CustomEvent<THighlight>;
}
