import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LanguageType } from "./languages";

export type LangtagProps = {
  /**
   * Set to `true` for the language name to be
   * displayed at the top right of the code block.
   *
   * Use style props to customize styles:
   * - `--langtag-top`
   * - `--langtag-right`
   * - `--langtag-background`
   * - `--langtag-color`
   * - `--langtag-border-radius`
   * - `--langtag-padding`
   *
   * @default false
   */
  langtag?: boolean;

  /**
   * Customize the top position of the langtag.
   * @default 0
   */
  "--langtag-top"?: string | number;

  /**
   * Customize the right position of the langtag.
   * @default 0
   */
  "--langtag-right"?: string | number;

  /**
   * Customize the background color of the langtag.
   * @default "inherit"
   */
  "--langtag-background"?: string;

  /**
   * Customize the text color of the langtag.
   * @default "inherit"
   */
  "--langtag-color"?: string;

  /**
   * Customize the border radius of the langtag.
   * @default 0
   */
  "--langtag-border-radius"?: string;

  /**
   * Customize the padding of the langtag.
   * @default "1em"
   */
  "--langtag-padding"?: string;
};

export type HighlightProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
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
  };

export type HighlightEvents = {
  highlight: CustomEvent<{
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;
  }>;
};

export type HighlightSlots = {
  default: {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;
  };
};

export default class Highlight extends SvelteComponentTyped<
  HighlightProps,
  HighlightEvents,
  HighlightSlots
> {}
