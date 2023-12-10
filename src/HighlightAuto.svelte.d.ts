import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type HighlightAutoProps = HTMLAttributes<HTMLPreElement> & {
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
};

export type HighlightAutoEvents = {
  highlight: CustomEvent<{
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;

    /**
     * The language name inferred by `highlight.js`.
     * @example "css"
     */
    language: string;
  }>;
};

export type HighlightAutoSlots = {
  default: {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;
  };
};

export default class HighlightAuto extends SvelteComponentTyped<
  HighlightAutoProps,
  HighlightAutoEvents,
  HighlightAutoSlots
> {}
