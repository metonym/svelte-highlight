import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type TypewriterProps = HTMLAttributes<HTMLPreElement> & {
  /** Highlighted HTML from `Highlight`'s `highlighted` slot. @default "" */
  highlighted?: string;

  /** Milliseconds per character; `0` reveals everything at once. @default 30 */
  speed?: number;

  /** Pause with `false`; resume picks up where it left off. @default true */
  play?: boolean;

  /**
   * Maps elapsed-time fraction (0-1) to revealed fraction (0-1). Changes
   * pacing only; total duration stays `speed * total`.
   * @default linear
   */
  easing?: (t: number) => number;

  /** Reveal one character or one word per step. @default "char" */
  granularity?: "char" | "word";

  /** Revealed character count; read-only, for `bind:revealed`. @default 0 */
  revealed?: number;

  /** Total visible characters; read-only, for `bind:total`. @default 0 */
  total?: number;

  /** Width of the blinking caret. @default "0.6em" */
  "--caret-width"?: string;

  /** Height of the blinking caret. @default "1.1em" */
  "--caret-height"?: string;

  /** Gap between typed text and the caret. @default "1px" */
  "--caret-gap"?: string;

  /** Color of the blinking caret. @default "currentColor" */
  "--caret-color"?: string;

  /** Duration of one caret blink cycle. @default "1s" */
  "--caret-blink"?: string;
};

export type TypewriterEvents = {
  /** Fires when typing finishes. */
  done: CustomEvent<null>;

  /** Fires whenever `revealed` advances. */
  progress: CustomEvent<{ revealed: number; total: number }>;
};

export default class Typewriter extends SvelteComponentTyped<
  TypewriterProps,
  TypewriterEvents,
  Record<string, never>
> {}
