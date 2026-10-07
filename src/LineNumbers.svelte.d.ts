import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LangtagProps } from "./Highlight.svelte";
import type { LanguageName } from "./languages";

export type LineNumbersProps = HTMLAttributes<HTMLDivElement> &
  LangtagProps & {
    /**
     * Highlighted HTML. Required unless `lines` is passed.
     * @example
     * <Highlight language={typescript} {code} langtag let:highlighted let:langtag let:languageName>
     *  <LineNumbers {highlighted} {langtag} {languageName} />
     * </Highlight>
     */
    highlighted?: string;

    /**
     * Pre-split per-line HTML (e.g. from `splitLines` or
     * `TokenizedDocument#lineRange`). Overrides `highlighted`; use it to
     * render a window of a larger document.
     */
    lines?: string[];

    /**
     * Total document line count for gutter width when `lines` is a window.
     * @example
     * <LineNumbers lines={doc.lineRange(start, end)} startingLineNumber={start + 1} lineCount={doc.lineCount()} />
     */
    lineCount?: number;

    /** Language name. @default "plaintext" */
    languageName?: LanguageName | (string & {});

    /** Hide the line numbers column border. @default false */
    hideBorder?: boolean;

    /** Starting line number. @default 1 */
    startingLineNumber?: number;

    /** Wrap long lines. @default false */
    wrapLines?: boolean;

    /**
     * Line indices to highlight.
     * @default []
     * @example [0, 1, 9]
     */
    highlightedLines?: number[];

    /**
     * Per-line state, indexed relative to `lines`/`highlighted`. Merged with
     * `highlightedLines`. `"focus"` is exempt from dimming but has no
     * background.
     * @default {}
     * @example { 1: "added", 2: "removed", 4: "focus" }
     */
    lineStates?: Record<number, "highlighted" | "focus" | "added" | "removed">;

    /** Line number text color. @default currentColor */
    "--line-number-color"?: string;

    /**
     * Width of one gutter digit; the gutter scales with the digit count.
     * @default "0.6em"
     */
    "--line-number-digit-width"?: string;

    /** Border color. @default currentColor */
    "--border-color"?: string;

    /** Left cell padding. @default 1em */
    "--padding-left"?: number | string;

    /** Right cell padding. @default 1em */
    "--padding-right"?: number | string;

    /** Highlighted line background. @default "rgba(254, 241, 96, 0.2)" */
    "--highlighted-background"?: string;

    /**
     * Background of lines with a `lineStates` `"added"` state.
     * @default "rgba(46, 204, 113, 0.15)"
     */
    "--line-added-background"?: string;

    /**
     * Background of lines with a `lineStates` `"removed"` state.
     * @default "rgba(231, 76, 60, 0.15)"
     */
    "--line-removed-background"?: string;

    /**
     * Un-highlighted line opacity when any line has a state.
     * @default 1
     * @example 0.4
     */
    "--unhighlighted-opacity"?: number | string;

    /**
     * Un-highlighted line filter when any line has a state.
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
