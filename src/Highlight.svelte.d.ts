import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LanguageType } from "./languages";

export type LangtagProps = {
  /**
   * Set to `true` to show the language name at the top right.
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
   * Langtag top offset.
   * @default 0
   */
  "--langtag-top"?: string | number;

  /**
   * Langtag right offset.
   * @default 0
   */
  "--langtag-right"?: string | number;

  /**
   * Langtag background.
   * @default "inherit"
   */
  "--langtag-background"?: string;

  /**
   * Langtag text color.
   * @default "inherit"
   */
  "--langtag-color"?: string;

  /**
   * Langtag border radius.
   * @default 0
   */
  "--langtag-border-radius"?: string;

  /**
   * Langtag padding.
   * @default "1em"
   */
  "--langtag-padding"?: string;
};

export type HighlightProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /**
     * Code to highlight.
     */
    code: any;

    /**
     * highlight.js language module.
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
