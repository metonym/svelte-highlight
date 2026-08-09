import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type TypewriterProps = HTMLAttributes<HTMLPreElement> & {
  /**
   * Highlighted HTML from `Highlight`'s `highlighted` slot.
   * @default ""
   */
  highlighted?: string;

  /**
   * Milliseconds between characters.
   * @default 30
   */
  speed?: number;

  /**
   * Pause with `false`; resume picks up where it left off.
   * @default true
   */
  play?: boolean;

  /**
   * Reveal-progress curve: maps elapsed-time fraction (0-1) to
   * revealed-fraction (0-1). Total typing duration is always
   * `speed * <visible character count>` regardless of curve. Import a named
   * curve (`easeOutQuad`, `easeInOutCubic`, ...) or pass your own function.
   * @default linear
   */
  easing?: (t: number) => number;

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
   * Gap between typed text and the caret.
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

export type TypewriterEvents = {
  /**
   * Fires when typing finishes.
   */
  done: CustomEvent<null>;
};

export default class Typewriter extends SvelteComponentTyped<
  TypewriterProps,
  TypewriterEvents,
  Record<string, never>
> {}
