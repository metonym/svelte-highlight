import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type LineNumbersProps = HTMLAttributes<HTMLPreElement> & {
  /**
   * Pass the highlighted `code` to `LineNumbers`.
   * @example
   * <Highlight language={typescript} {code} let:highlighted>
   *  <LineNumbers {highlighted} />
   * </Highlight>
   */
  highlighted: string;

  /**
   * Set to `true` to hide the border of the line numbers column.
   * @default false
   */
  hideBorder?: boolean;

  /**
   * Specify which starting line number should be displayed.
   * @default 1
   */
  startingLineNumber?: number;

  /**
   * Set to `true` for lines to wrap.
   * @default false
   */
  wrapLines?: boolean;

  /**
   * Specify the line indices to highlight.
   * @default []
   * @example [0, 1, 9]
   */
  highlightedLines?: number[];

  /**
   * Specify the text color for line numbers.
   * Defaults to the current theme color applied to `.hljs code`.
   * @default currentColor
   * @example "pink"
   */
  "--line-number-color"?: string;

  /**
   * Specify the border color.
   * Defaults to the current background color applied to `.hljs`.
   * @default currentColor
   * @example "#fff"
   */
  "--border-color"?: string;

  /**
   * Specify the left padding for `td` elements.
   * @default 1em
   * @example 0
   */
  "--padding-left"?: number | string;

  /**
   * Specify the right padding for `td` elements.
   * @default 1em
   * @example 0
   */
  "--padding-right"?: number | string;

  /**
   * Specify the background color of highlighted lines.
   * @default "rgba(254, 241, 96, 0.2)"
   * @example "#fff"
   */
  "--highlighted-background"?: string;
};

export type LineNumbersEvents = {};

export type LineNumbersSlots = {};

export default class LineNumbers extends SvelteComponentTyped<
  LineNumbersProps,
  LineNumbersEvents,
  LineNumbersSlots
> {}
