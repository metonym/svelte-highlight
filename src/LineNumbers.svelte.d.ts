import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LangtagProps } from "./Highlight.svelte";
import type { LanguageName } from "./languages";

export type LineNumbersProps = HTMLAttributes<HTMLDivElement> &
  LangtagProps & {
    /**
     * Pass the highlighted `code` to `LineNumbers`. Required unless `lines`
     * is passed instead.
     * @example
     * <Highlight language={typescript} {code} langtag let:highlighted let:langtag let:languageName>
     *  <LineNumbers {highlighted} {langtag} {languageName} />
     * </Highlight>
     */
    highlighted?: string;

    /**
     * Pre-split per-line HTML, the same shape `splitLines`/`extendLines`/
     * `TokenizedDocument#lineRange` produce. Overrides `highlighted` --
     * pass a window of a larger document to render it without re-splitting
     * the full string on every update. `highlightedLines`/`lineStates`
     * index relative to this array, not the absolute document line.
     * @default undefined
     */
    lines?: string[];

    /**
     * Total document line count, for gutter-width purposes, when `lines` is
     * a partial window rather than the whole document. Combine with
     * `startingLineNumber` to offset row numbers for the window.
     * @default undefined
     * @example
     * <LineNumbers lines={doc.lineRange(start, end)} startingLineNumber={start + 1} lineCount={doc.lineCount()} />
     */
    lineCount?: number;

    /**
     * Language name.
     * @default "plaintext"
     */
    languageName?: LanguageName | (string & {});

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
     * Per-line decoration state, indexed relative to `lines`/`highlighted`
     * (not the absolute document line when rendering a window). Merged with
     * `highlightedLines`, which is equivalent to setting `"highlighted"`
     * here. `"focus"` is exempt from dimming but renders no background --
     * the primitive for a meta-string highlight or a diff's context-line
     * emphasis without red/green paint.
     * @default {}
     * @example { 1: "added", 2: "removed", 4: "focus" }
     */
    lineStates?: Record<number, "highlighted" | "focus" | "added" | "removed">;

    /**
     * Line number text color.
     * Defaults to the current theme color applied to `.hljs code`.
     * @default currentColor
     * @example "pink"
     */
    "--line-number-color"?: string;

    /**
     * Width of a single gutter digit. The gutter's total width is
     * `calc(<digit count> * --line-number-digit-width)`, so it scales
     * automatically with the code font-size instead of a fixed pixel guess.
     * @default "0.6em"
     * @example "0.65em"
     */
    "--line-number-digit-width"?: string;

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
     * Background of lines with a `lineStates` `"added"` state.
     * @default "rgba(46, 204, 113, 0.15)"
     * @example "#fff"
     */
    "--line-added-background"?: string;

    /**
     * Background of lines with a `lineStates` `"removed"` state.
     * @default "rgba(231, 76, 60, 0.15)"
     * @example "#fff"
     */
    "--line-removed-background"?: string;

    /**
     * Un-highlighted line opacity.
     * Only applies when `highlightedLines` or `lineStates` is non-empty.
     * @default 1
     * @example 0.4
     */
    "--unhighlighted-opacity"?: number | string;

    /**
     * Un-highlighted line filter.
     * Only applies when `highlightedLines` or `lineStates` is non-empty.
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
