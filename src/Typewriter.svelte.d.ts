import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type TypewriterProps = HTMLAttributes<HTMLPreElement> & {
  /**
   * Highlighted HTML from `Highlight`'s `highlighted` slot.
   * @default ""
   */
  highlighted?: string;

  /**
   * Milliseconds between characters. `0` reveals all content on the first
   * frame -- a "skip typing" escape hatch (e.g. a skip button, or finishing
   * an off-screen instance instantly).
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
   * Number of visible characters currently revealed. Read-only in practice
   * (overwritten every frame); exposed for `bind:revealed`.
   * @default 0
   */
  revealed?: number;

  /**
   * Total number of visible characters in `highlighted`. Read-only in
   * practice (overwritten every reactive flush); exposed for `bind:total`.
   * @default 0
   */
  total?: number;

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

  /**
   * Fires whenever `revealed` advances, with the current `revealed`/`total`.
   */
  progress: CustomEvent<{ revealed: number; total: number }>;
};

export default class Typewriter extends SvelteComponentTyped<
  TypewriterProps,
  TypewriterEvents,
  Record<string, never>
> {}
