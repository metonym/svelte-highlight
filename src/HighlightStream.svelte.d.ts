import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LanguageType } from "./languages";

export type HighlightStreamProps = HTMLAttributes<HTMLPreElement> & {
  /**
   * Growing code buffer; chunks may split mid-token or mid-line.
   * @default ""
   */
  code?: string;

  /**
   * highlight.js language module.
   * Import languages from `svelte-highlight/languages/*`.
   * @example
   * import typescript from "svelte-highlight/languages/typescript";
   */
  language: LanguageType<string>;

  /**
   * Stream finished: hides the caret and performs one final full highlight.
   * @default false
   */
  done?: boolean;

  /**
   * Show a blinking caret at the end of output while `!done`.
   * @default true
   */
  caret?: boolean;

  /**
   * Stick to the bottom while streaming, unless the user scrolls away.
   * @default false
   */
  autoScroll?: boolean;

  /**
   * Render only the lines in the viewport (plus `overscan`). Output stays the
   * streaming parse even once `done`, and `on:highlight` is not dispatched.
   * @default false
   */
  virtualize?: boolean;

  /**
   * Extra lines rendered above and below the viewport when `virtualize` is set.
   * @default 12
   */
  overscan?: number;

  /**
   * Lines between engine checkpoints when `virtualize` is set.
   * @default 100
   */
  checkpointInterval?: number;

  /**
   * Announced by a polite live region once `done`. Set to `""` to disable.
   * @default "Code finished streaming"
   */
  doneText?: string;

  /**
   * Width of the blinking caret.
   * @default "0.6em"
   */
  "--caret-width"?: string;

  /**
   * Height of the blinking caret.
   * @default "1.1em"
   */
  "--caret-height"?: string;

  /**
   * Gap before the caret.
   * @default "1px"
   */
  "--caret-gap"?: string;

  /**
   * Color of the blinking caret.
   * @default "currentColor"
   */
  "--caret-color"?: string;

  /**
   * Duration of one caret blink cycle.
   * @default "1s"
   */
  "--caret-blink"?: string;
};

export type HighlightStreamEvents = {
  highlight: CustomEvent<{
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;
  }>;

  /** Fires after the final full highlight once `done` is set. */
  done: CustomEvent<null>;

  /** Fires whenever the rendered window changes; `virtualize` mode only. */
  windowchange: CustomEvent<{
    /** Index of the first rendered line (inclusive). */
    start: number;
    /** Index of the last rendered line (exclusive). */
    end: number;
    /** Total number of lines in the document so far. */
    lineCount: number;
  }>;
};

export default class HighlightStream extends SvelteComponentTyped<
  HighlightStreamProps,
  HighlightStreamEvents,
  Record<string, never>
> {
  /** Scroll a given line into the rendered window. */
  scrollToLine(line: number): void;
}
