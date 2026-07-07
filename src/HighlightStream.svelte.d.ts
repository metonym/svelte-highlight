import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LanguageType } from "./languages";

export type HighlightStreamProps = HTMLAttributes<HTMLPreElement> & {
  /**
   * Growing code buffer. Append chunks as they arrive; arbitrary chunk
   * boundaries (mid-token, mid-line) are handled.
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
   * Keep the container scrolled to the bottom while streaming, unless the
   * user has scrolled away from the bottom.
   * @default false
   */
  autoScroll?: boolean;

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
   * Gap between output and the caret.
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

  /**
   * Fires after the final full highlight once `done` is set.
   */
  done: CustomEvent<null>;
};

export default class HighlightStream extends SvelteComponentTyped<
  HighlightStreamProps,
  HighlightStreamEvents,
  Record<string, never>
> {}
