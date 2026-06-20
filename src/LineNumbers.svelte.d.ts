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
     * Provide the language name.
     * @default "plaintext"
     */
    languageName?: LanguageName | (string & {});

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

    /**
     * Specify the opacity of un-highlighted lines.
     * Only applies when `highlightedLines` is non-empty.
     * @default 1
     * @example 0.4
     */
    "--unhighlighted-opacity"?: number | string;

    /**
     * Specify a CSS filter for un-highlighted lines.
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
