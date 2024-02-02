import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type HighlightSvelteProps = HTMLAttributes<HTMLPreElement> & {
  /**
   * Specify the text to highlight.
   */
  code: any;

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

export type HighlightSvelteEvents = {
  highlight: CustomEvent<{
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;
  }>;
};

export type HighlightSvelteSlots = {
  default: {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;
  };
};

export default class HighlightSvelte extends SvelteComponentTyped<
  HighlightSvelteProps,
  HighlightSvelteEvents,
  HighlightSvelteSlots
> {}
