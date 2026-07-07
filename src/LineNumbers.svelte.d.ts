import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LangtagProps } from "./Highlight.svelte";
import type { LanguageName } from "./languages";

export type LineNumbersProps = HTMLAttributes<HTMLDivElement> &
  LangtagProps & {
    /**
     * Pass the highlighted `code` to `LineNumbers`.
     * @example
     * <Highlight language={typescript} {code} langtag let:highlighted let:langtag let:languageName>
     *  <LineNumbers {highlighted} {langtag} {languageName} />
     * </Highlight>
     */
    highlighted: string;

    /**
     * Language name.
     * @default "plaintext"
     */
    languageName?: LanguageName | (string & {});

    /**
     * Accessible name for the scrollable code region.
     * @default "Code with line numbers"
     */
    label?: string;

    /**
     * Set to `true` to hide the border of the line numbers column.
     * @default false
     */
    hideBorder?: boolean;

    /**
     * Starting line number.
     * @default 1
     */
    startingLineNumber?: number;

    /**
     * Set to `true` for lines to wrap.
     * @default false
     */
    wrapLines?: boolean;

    /**
     * Line indices to highlight.
     * @default []
     * @example [0, 1, 9]
     */
    highlightedLines?: number[];

    /**
     * Line number text color.
     * Defaults to the current theme color applied to `.hljs code`.
     * @default currentColor
     * @example "pink"
     */
    "--line-number-color"?: string;

    /**
     * Border color.
     * Defaults to the current background color applied to `.hljs`.
     * @default currentColor
     * @example "#fff"
     */
    "--border-color"?: string;

    /**
     * Left cell padding.
     * @default 1em
     * @example 0
     */
    "--padding-left"?: number | string;

    /**
     * Right cell padding.
     * @default 1em
     * @example 0
     */
    "--padding-right"?: number | string;

    /**
     * Highlighted line background.
     * @default "rgba(254, 241, 96, 0.2)"
     * @example "#fff"
     */
    "--highlighted-background"?: string;

    /**
     * Un-highlighted line opacity.
     * Only applies when `highlightedLines` is non-empty.
     * @default 1
     * @example 0.4
     */
    "--unhighlighted-opacity"?: number | string;

    /**
     * Un-highlighted line filter.
     * Only applies when `highlightedLines` is non-empty.
     * @default none
     * @example "blur(2px)"
     */
    "--unhighlighted-filter"?: string;
  };

export type LineNumbersEvents = {};

export type LineNumbersSlots = {};

export default class LineNumbers extends SvelteComponentTyped<
  LineNumbersProps,
  LineNumbersEvents,
  LineNumbersSlots
> {}
